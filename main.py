from flask import Flask, send_from_directory, request, render_template_string
from ebay_oauth_token import OAuthToken
import requests
client_id = "HaiboLi-CS571-PRD-edd8a54fc-01e3579b"
client_secret = "PRD-dd8a54fc2866-462e-49bd-9032-306d"
# Create an instance of the OAuthUtility class
oauth_utility = OAuthToken(client_id, client_secret)
# Get the application token
application_token = oauth_utility.getApplicationToken()

app = Flask(__name__)


@app.route('/')
def hello_world():  # put application's code here
    payload = {'key1': 'value1'}
    r = requests.get('https://api.github.com/events')
    # print(r.json())
    return send_from_directory('static', 'index.html');


@app.route('/submit', methods=['GET'])
def submit():
    keywords = request.args.get('keywords')
    sort_order = request.args.get('sortOrder')
    min_price = request.args.get('minPrice')
    max_price = request.args.get('maxPrice')
    returns_accepted_only = request.args.get('returnsAcceptedOnly')
    free_shipping_only = request.args.get('freeShippingOnly')
    expedited_shipping_type = request.args.get('expeditedShippingType')

    condition = request.args.get('condition')
    url = 'https://svcs.ebay.com/services/search/FindingService/v1'
    payload = {
        'OPERATION-NAME': 'findItemsAdvanced',
        'SERVICE-VERSION': '1.0.0',
        'SECURITY-APPNAME': 'HaiboLi-CS571-PRD-edd8a54fc-01e3579b',
        'RESPONSE-DATA-FORMAT': 'JSON',
        'REST-PAYLOAD': '',
        'paginationInput.entriesPerPage': 10
    }
    if keywords: payload['keywords'] = keywords
    if sort_order: payload['sortOrder'] = sort_order
    filters = []

    if min_price: filters.append({'name': 'MinPrice', 'value': min_price, 'paramName': 'Currency', 'paramValue':'USD'})
    if max_price: filters.append({'name': 'MaxPrice', 'value': max_price, 'paramName': 'Currency', 'paramValue':'USD'})
    if returns_accepted_only: filters.append({'name': 'ReturnsAcceptedOnly', 'value': returns_accepted_only})
    if free_shipping_only: filters.append({'name': 'FreeShippingOnly', 'value': free_shipping_only})
    if expedited_shipping_type: filters.append({'name': 'ExpeditedShippingType', 'value': expedited_shipping_type})
    if condition:
        condition_values = condition.split(',')
        condition_filter = {'name': 'Condition', 'values': condition_values}
        filters.append(condition_filter)

    for i, find_filter in enumerate(filters):
        payload[f'itemFilter({i}).name'] = find_filter['name']
        if 'values' in find_filter:
            for j, value in enumerate(find_filter['values']):
                payload[f'itemFilter({i}).value({j})'] = value
        else:
            payload[f'itemFilter({i}).value'] = find_filter['value']
        if 'paramName' in find_filter:
            payload[f'itemFilter({i}).paramName'] = find_filter['paramName']
        if 'paramValue' in find_filter:
            payload[f'itemFilter({i}).paramValue'] = find_filter['paramValue']
    response = requests.get(url, params=payload)
    print(response.url)
    print(response.json())
    return response.json()

@app.route('/singleItem', methods=['GET'])
def singleItem():
    itemId = request.args.get('itemId')
    url = "https://open.api.ebay.com/shopping"
    payload = {
        'callname':'GetSingleItem',
        'responseencoding':'JSON',
        'appid':'HaiboLi-CS571-PRD-edd8a54fc-01e3579b',
        'siteid':'0',
        'version':'967',
        'ItemId':itemId,
        'IncludeSelector':'Description,Details,ItemSpecifics'
    }
    headers = {
    "X-EBAY-API-IAF-TOKEN": oauth_utility.getApplicationToken()
    }
    response = requests.get(url, params=payload, headers=headers)
    print(response.url)
    print(response.json())
    return response.json()


if __name__ == '__main__':
    app.run()
