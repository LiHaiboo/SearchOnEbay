let keyWords = document.getElementById("keywords")
let priceFromInput = document.getElementById("price_from");
let priceToInput = document.getElementById("price_to");
let sortOrder = document.getElementById("sort_by");
let seller = document.getElementById("seller");
let free = document.getElementById("free");
let expedited = document.getElementById("expedited");
let conditionNew = document.getElementById("condition_new");
let conditionUsed = document.getElementById("condition_used");
let conditionVeryGood = document.getElementById("condition_very_good");
let conditionGood = document.getElementById("condition_good");
let conditionAcceptable = document.getElementById("condition_acceptable");


$(document).ready(function() {
    var items = [];
    var responseCache = null;

    $('#submitData').click(function () {
        console.log("clicked");
        validateRes = validateForm();
        if(!validateRes) return false;

        $('#itemDetail').hide();
        $('#results').show();


        var conditions=[];
        $('input[name="condition"]:checked').each(function() {
            conditions.push($(this).val());
        });
        var conditionString = conditions.join(',');

        var dataToSend = {
                "keywords": keyWords.value,
                "sortOrder": sortOrder.value,
                "minPrice": priceFromInput.value,
                "maxPrice": priceToInput.value,
                "returnsAcceptedOnly": seller.checked,
                "freeShippingOnly": free.checked
            };
        //var expeditedShippingType = $('#expedited').is(':checked') ? "Expedited" : null;
        var expeditedShippingType = expedited.checked ? "Expedited" : null;
        if (expeditedShippingType) {
            dataToSend.expeditedShippingType = expeditedShippingType;
        }
        if(conditionString) {
            dataToSend.condition = conditionString;
        }

        //todo add restriction of number

          $.ajax({
            url: '/submit',
            method: 'GET',
              // dataType: JSON,
            data: dataToSend,
            success: function(response) {
                items = response.findItemsAdvancedResponse[0].searchResult[0].item;
                responseCache = response;
                if (items && items.length) {
                    displayItems(items.slice(0, 3), response);
                } else {
                    $('#results').html('<div class="no_result">No Results found<div>');
                }

                if(items.length > 3) {
                    $('#toggleView').show().text('Show More');
                } else {
                    $('#toggleView').hide();
                }
            },
            error: function(jqXHR, textStatus, err) {
                alert('text status '+textStatus+', err '+err)
            }
        });
    });
    $('#reset').click(function () {
        console.log("reset");
        keyWords.value = '';
        priceFromInput.value = '';
        priceToInput.value = '';
        sortOrder.value = 'BestMatch';
        seller.value = '';
        $('input[type="checkbox"]').prop('checked', false);
        // free.check = false;
        // expedited.check = false;
        // conditionNew.check = false;
        // conditionUsed.check = false;
        // conditionVeryGood.check = false;
        // conditionGood.check = false
        // conditionAcceptable.value = false;

    });

    $('#toggleView').click(function() {
        if ($(this).text() === 'Show More') {
            displayItems(items.slice(0, 10), responseCache); // show up to 10 items
            $(this).text('Show Less');
            window.scrollTo(0, document.body.scrollHeight); // scroll to bottom
        } else {
            displayItems(items.slice(0, 3), responseCache); // show only 3 items
            $(this).text('Show More');
            window.scrollTo(0, 0); // scroll to top
        }
    });

    function displayItems(items, responseStr) {
        var resultsHTML = '<div class="result_title">' + responseStr.findItemsAdvancedResponse[0].paginationOutput[0].totalEntries[0] + ' Results found for <span>' + keyWords.value + '</span></div>';
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            resultsHTML += '<div class="item" data-itemid="' + item.itemId[0]+ '">';
            if(item.galleryURL[0] === '') {
                item.galleryURL[0] = 'https://csci571.com/hw/hw6/images/ebay_default.jpg';
            }
            resultsHTML += '<div class="pic"> <img src="' + item.galleryURL[0] + '" alt="' + item.title[0] + '"></div>';
            resultsHTML += '<div class="intro">';
            resultsHTML += '<div class="title">' + item.title[0] + '</div>';
            resultsHTML += '<p>Category: <span>' + item.primaryCategory[0].categoryName[0] + '</span><a href="' + item.viewItemURL[0] +'"><img src="https://csci571.com/hw/hw6/images/redirect.png" class="redirect-icon" alt="Redirct"></a></p>';
            if(item.condition) {
                if(item.topRatedListing[0] === "true") {
                    resultsHTML += '<p style="margin-top: -10px;">Condition: ' + item.condition[0].conditionDisplayName[0] + '<img src="https://csci571.com/hw/hw6/images/topRatedImage.png" class="top-icon" alt="Top Rated"></p>';
                } else {
                    resultsHTML += '<p>Condition: ' + item.condition[0].conditionDisplayName[0] + '</p>';
                }
            }

            //resultsHTML += '<a href="' + item.viewItemURL[0] + '">' + item.title[0] + '</a>';
            resultsHTML += '<div class="title">Price: $' + item.sellingStatus[0].currentPrice[0].__value__;
            if(item.shippingInfo && item.shippingInfo[0].shippingServiceCost && item.shippingInfo[0].shippingServiceCost[0].__value__ !== "0.0") {
                resultsHTML += '(+' + item.shippingInfo[0].shippingServiceCost[0].__value__ + ' for shipping)'
            }
            resultsHTML += '</div>';
            resultsHTML += '</div>';
            resultsHTML += '</div>';
        }
        $('#results').html(resultsHTML);
    }



    $(document).on('click', '.item', function() {

        var itemId = $(this).data('itemid');
        //console.log("itemId = " + itemId);
        $.ajax({
            url: '/singleItem',
            method: 'GET',
              // dataType: JSON,
            data: {
                "itemId":itemId
            },
            success: function(response) {
                var tableHTML = '<table>';
                var item = response.Item;
                console.log(response)

                var picUrl;
                if(!item.PictureURL || item.PictureURL[0] === '') {
                    picUrl = 'https://csci571.com/hw/hw6/images/ebay_default.jpg';
                } else {
                    picUrl = item.PictureURL[0];
                }
                tableHTML += '<tr>';
                tableHTML += '<td>Photo</td>';
                tableHTML += '<td><img src="' + picUrl + '" alt="' + item.Title +'"></td>';
                tableHTML += '</tr>';
                if(item.ViewItemURLForNaturalSearch) {
                    tableHTML += '<tr>';
                    tableHTML += '<td>ebay Link</td>';
                    tableHTML += '<td><a href="' + item.ViewItemURLForNaturalSearch +'">eBay Product Link</a></td>';
                    tableHTML += '</tr>';
                }
                if(item.SubTitle) {
                    tableHTML += '<tr>';
                    tableHTML += '<td>SubTitle</td>';
                    tableHTML += '<td>' + item.SubTitle +'</td>';
                    tableHTML += '</tr>';
                }
                if(item.CurrentPrice && item.CurrentPrice.Value) {
                    tableHTML += '<tr>';
                    tableHTML += '<td>Price</td>';
                    tableHTML += '<td>' + item.CurrentPrice.Value + ' ' + item.CurrentPrice.CurrencyID +'</td>';
                    tableHTML += '</tr>';
                }
                if(item.Location && item.PostalCode) {
                    tableHTML += '<tr>';
                    tableHTML += '<td>Location</td>';
                    tableHTML += '<td>' + item.Location + ', ' + item.PostalCode +'</td>';
                    tableHTML += '</tr>';
                } else if(item.Location) {
                    tableHTML += '<tr>';
                    tableHTML += '<td>Location</td>';
                    tableHTML += '<td>' + item.Location + '</td>';
                    tableHTML += '</tr>';
                }
                if(item.Seller && item.Seller.UserID) {
                    tableHTML += '<tr>';
                    tableHTML += '<td>Seller</td>';
                    tableHTML += '<td>' + item.Seller.UserID +'</td>';
                    tableHTML += '</tr>';
                }
                if(item.ReturnPolicy && item.ReturnPolicy.ReturnsAccepted && item.ReturnPolicy.ReturnsWithin) {
                    tableHTML += '<tr>';
                    tableHTML += '<td>Return Policy (US)</td>';
                    tableHTML += '<td>' + item.ReturnPolicy.ReturnsAccepted + ' with in ' + item.ReturnPolicy.ReturnsWithin + '</td>';
                    tableHTML += '</tr>';
                } else if (item.ReturnPolicy && item.ReturnPolicy.ReturnsAccepted) {
                    tableHTML += '<tr>';
                    tableHTML += '<td>Return Policy (US)</td>';
                    tableHTML += '<td>' + item.ReturnPolicy.ReturnsAccepted + '</td>';
                    tableHTML += '</tr>';
                } else if(item.ReturnPolicy && item.ReturnPolicy.ReturnsWithin) {
                    tableHTML += '<tr>';
                    tableHTML += '<td>Return Policy (US)</td>';
                    tableHTML += '<td>with in ' + item.ReturnPolicy.ReturnsWithin + '</td>';
                    tableHTML += '</tr>';
                }

                if(item.ItemSpecifics && item.ItemSpecifics.NameValueList) {
                    var specifics = item.ItemSpecifics.NameValueList;
                    $.each(specifics, function(index, specific) {
                        tableHTML += '<tr>';
                        tableHTML += '<td>' + specific.Name + '</td>';
                        tableHTML += '<td>' + specific.Value[0] + '</td>';
                        tableHTML += '</tr>';
                    });
                }

                tableHTML += '</table>';


                // 将详细信息插入到.itemDetailedContent中
                $('.itemDetailedContent').html(tableHTML);

                $('#results').hide();
                $('#toggleView').hide();
                $('#itemDetail').show();
            },
            error: function(jqXHR, textStatus, err) {
                alert('text status '+textStatus+', err '+err)
            }
        });


    });

    $('#backButton').click(function() {
        $('#itemDetail').hide();
        $('#results').show();
        if(items.length > 3) {
            $('#toggleView').show();
        }
    });
});


function validateForm() {

  console.log(keyWords.value);

  //keywords cannot be null
  if(!keyWords.reportValidity()) {
      return false;
  }

  const priceFrom = parseFloat(priceFromInput.value);
  const priceTo = parseFloat(priceToInput.value);
  // Check if the values are valid numbers
  const priceFromIsValid = !isNaN(priceFrom);
  const priceToIsValid = !isNaN(priceTo);

  if (priceFromIsValid && priceToIsValid) {
    if (priceFrom < 0 || priceTo < 0) {
      alert(
        "Price Range values cannot be negative! Please try a value greater than or equal to 0.0"
      );
      return false;
    } else if (priceFrom > priceTo) {
      alert(
        "Oops! Lower price limit cannot be greater than upper price limit!\nPlease try again."
      );
      return false;
    }
  } else if (!priceFromIsValid && priceToIsValid) {
    alert("Minimum price is not a valid positive number.");
    return false;
  } else if (priceFromIsValid && !priceToIsValid) {
    alert("Maximum price is not a valid positive number.");
    return false;
  }
  return true; // Return true if validation passes
}
