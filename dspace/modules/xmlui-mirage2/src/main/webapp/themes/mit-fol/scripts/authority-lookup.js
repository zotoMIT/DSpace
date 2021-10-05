/*
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
function AuthorLookup(url, authorityInput, collectionID) {
    var authorityType = 'author';
    var rowLabel = 'value';
    var predefinedOrder = ['last-name','first-name', 'mit-id', 'orcid-id', 'department'];
    var labelMap = { 'last-name': 'last name', 'first-name': 'first name' };
    var disabledDiscovery = false;
    var editItemNewMetadata = false;
    AuthorityLookup(url, authorityInput, collectionID, authorityType, rowLabel, predefinedOrder, labelMap, disabledDiscovery, editItemNewMetadata);
}

function DepartmentLookup(url, authorityInput, collectionID, editItemNewMetadata) {
    var authorityType = 'department';
    var rowLabel = 'shortName';
    var predefinedOrder = ['shortName','fullName'];
    var labelMap = { 'shortName': 'short name', 'fullName': 'full name' };
    var disabledDiscovery = true;
    AuthorityLookup(url, authorityInput, collectionID, authorityType, rowLabel, predefinedOrder, labelMap, disabledDiscovery, editItemNewMetadata);
}

/*
 *  Parameters:
 *  - url                   string      Url to the choices endpoint
 *  - authorityInput        string      The input-field bound to this lookup
 *  - collectionID          string      The ID of the collection we're working in
 *  - authorityType         string      The type of authority lower-cased e.g. 'author'
 *  - predefinedOrder       array       Predefined order of fields to display. Fields not found in this list are
 *                                      displayed in the order received from choices
 *  - labelMap              map         Maps properties to a displayable label
 *  - disabledDiscovery     boolean     Whether or not the link to discovery per authority value is disabled
 */
function AuthorityLookup(url, authorityInput, collectionID, authorityType, rowLabel, predefinedOrder, labelMap, disabledDiscovery, editItemNewMetadata) {
    var capitalizedAuthorityType = capitalizeFirstLetter(authorityType);
    var renderDiscoveryLink =
        '<li class="vcard-insolr">' +
            '<label>Items in this repository:&nbsp;</label>' +
            '<span/>' +
        '</li>';
    if(disabledDiscovery) {
        renderDiscoveryLink = '';
    }

    $(".authorlookup").remove();
    var content =   $(
        '<div class="authorlookup modal fade" tabindex="-1" role="dialog" aria-labelledby="personLookupLabel" aria-hidden="true">' +
            '<div class="modal-dialog">'+
                '<div class="modal-content">'+
                    '<div class="modal-header">'+
                        '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>'+
                        '<h4 class="modal-title" id="personLookupLabel">' + capitalizedAuthorityType + ' lookup</h4>'+
                    '</div>'+
                    '<div class="modal-body">'+
                        '<div title="' + capitalizedAuthorityType + ' Lookup">' +
                            '<table class="dttable col-xs-4">' +
                                '<thead>' +
                                    '<th>Name</th>' +
                                '</thead>' +
                                '<tbody>' +
                                    '<tr><td>Loading...<td></tr>' +
                                '</tbody>' +
                            '</table>' +
                            '<span class="no-vcard-selected">There\'s no one selected</span>' +
                            '<ul class="vcard list-unstyled" style="display: none;">' +
                                '<li><ul class="variable"/></li>'+
                                renderDiscoveryLink +
                                '<li class="vcard-add">' +
                                    '<input class="ds-button-field btn btn-default" value="Add This ' + capitalizedAuthorityType + '" type="button"/>' +
                                '</li>' +
                            '</ul>' +
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div>'+
        '</div>'
    );

    var moreButton = '<button id="lookup-more-button" class="btn btn-default">show more</button>';
    var lessButton = '<button id="lookup-less-button" class="btn btn-default">show less</button>';
    var button = moreButton;
    var firstLookup = true;

    var datatable = content.find("table.dttable");
    datatable.dataTable({
        "aoColumns": [
            {
                "bSortable": false,
                "sWidth": "200px"
            },
            {
                "bSortable": false,
                "bSearchable": false,
                "bVisible": false
            }
        ],
        "oLanguage": {
            "sInfo": 'Showing _START_ to _END_ of _TOTAL_ results',
            "sInfoEmpty": 'Showing 0 to 0 of 0 results',
            "sInfoFiltered": '(filtered from _MAX_ total results)',
            "sLengthMenu": '_MENU_ people/page',
            "sZeroRecords": 'No results found'
        },
        "bAutoWidth": false,
        "bJQueryUI": true,
        "bProcessing": true,
        "bSort": false,
        "bPaginate": false,
        "sPaginationType": "two_button",
        "bServerSide": true,
        "sAjaxSource": url,
        "sDom": '<"H"lfr><"clearfix"t<"vcard-wrapper col-xs-8">><"F"ip>',
        "fnInitComplete": function() {
            content.find("table.dttable").show();
            content.find("div.vcard-wrapper").append(content.find('.no-vcard-selected')).append(content.find('ul.vcard'));
            content.modal();

            content.find('.dataTables_wrapper').parent().attr('style', 'width: auto; min-height: 121px; height: auto;');
            var searchFilter = content.find('.dataTables_filter input');
            searchFilter.val(getLookupValue());
            setTimeout(function () {
                searchFilter.trigger($.Event("keyup", { keyCode: 13 }));
            }, 50);
            searchFilter.trigger($.Event("keyup", { keyCode: 13 }));
            searchFilter.addClass('form-control');
            content.find('.ui-corner-tr').removeClass('.ui-corner-tr');
            content.find('.ui-corner-tl').removeClass('.ui-corner-tl');

        },
        "fnInfoCallback": function( oSettings, iStart, iEnd, iMax, iTotal, sPre ) {
            return "Showing "+ iEnd + " results. "+button;
        },
        "fnRowCallback": function( nRow, aData, iDisplayIndex ) {
            aData = aData[1];
            var $row = $(nRow);

            var authorityID = $(this).closest('.dataTables_wrapper').find('.vcard-wrapper .vcard').data('authorityID');
            if (authorityID != undefined && aData['authority'] == authorityID) {
                $row.addClass('current-item');
            }

            $row.addClass('clickable');
            if(aData['insolr']=="false"){
                $row.addClass("notinsolr");
            }

            $row.click(function() {
                var $this = $(this);
                $this.siblings('.current-item').removeClass('current-item');
                $this.addClass('current-item');
                var wrapper = $this.closest('.dataTables_wrapper').find('.vcard-wrapper');
                wrapper.find('.no-vcard-selected:visible').hide();
                var vcard = wrapper.find('.vcard');
                vcard.data('authorityID', aData['authority']);
                vcard.data('name', aData['value']);

                var notDisplayed = ['insolr','value','authority'];
                var variable = vcard.find('.variable');
                variable.empty();
                predefinedOrder.forEach(function (entry) {
                    variableItem(aData, entry, variable);
                });

                for (var key in aData) {
                    if (aData.hasOwnProperty(key) && notDisplayed.indexOf(key) < 0 && predefinedOrder.indexOf(key) < 0) {
                        variableItem(aData, key, variable);
                    }
                }

                function variableItem(aData, key, variable) {
                    var label = key;
                    if(labelMap[key] == null) {
                        label = key.replace(/-/g, ' ');
                    } else {
                        label = labelMap[key];
                    }
                    var dataString = '';
                    dataString += '<li class="vcard-' + key + '">' +
                            '<label>' + label + ': </label>';

                    if(key == 'orcid'){
                        dataString +='<span><a target="_blank" href="http://orcid.org/' + aData[key] + '">' + aData[key] + '</a></span>';
                    } else {
                        dataString += '<span>' + aData[key] + '</span>';
                    }
                    dataString += '</li>';

                    variable.append(dataString);
                    return label;
                }

                if(aData['insolr']!="false"){
                    var discoverLink = window.DSpace.context_path + "/discover?filtertype=" + authorityType + "&filter_relational_operator=authority&filter=" + aData['insolr'];
                    vcard.find('.vcard-insolr span').empty().append('<a href="'+ discoverLink+'" target="_new">view items</a>');
                }else{
                    vcard.find('.vcard-insolr span').text("0");
                }
                vcard.find('.vcard-add input').click(function() {
                    if (authorityInput.indexOf('value_') != -1) {
                        // edit item
                        $('input[name=' + authorityInput + ']').val(vcard.find('.vcard-last-name span').text() + ', ' + vcard.find('.vcard-first-name span').text());
                        var oldAuthority = $('input[name=' + authorityInput + '_authority]');
                        oldAuthority.val(vcard.data('authorityID'));
                        $('textarea[name='+ authorityInput+']').val(vcard.data('name'));
                    } else {
                        // submission OR editItemNewMetadata
                        var inputName = authorityInput;
                        if(editItemNewMetadata) {
                            inputName = 'value'
                        }
                        var lastName = $('input[name=' + inputName + '_last]');
                        if (lastName.size()) { // author input type
                            lastName.val(vcard.find('.vcard-last-name span').text());
                            $('input[name=' + inputName + '_first]').val(vcard.find('.vcard-first-name span').text());
                        }
                        else { // other input types
                            if(editItemNewMetadata) {
                                $('textarea[name=' + inputName + ']').val(vcard.data('name'));
                                $('#aspect_administrative_item_EditItemMetadataForm_field_submit_add').attr('disabled', false);
                            } else {
                                $('input[name=' + inputName + ']').val(vcard.data('name'));
                            }
                        }

                        $('input[name=' + inputName + '_authority]').val(vcard.data('authorityID'));
                        $('input[name=submit_'+ inputName +'_add]').click();

                    }
                    content.modal('hide');
                });
                vcard.show();
            });

            return nRow;
        },
        "fnDrawCallback": function() {
            var wrapper = $(this).closest('.dataTables_wrapper');
            if (wrapper.find('.current-item').length > 0) {
                wrapper.find('.vcard-wrapper .no-vcard-selected:visible').hide();
                wrapper.find('.vcard-wrapper .vcard:hidden').show();
            }
            else {
                wrapper.find('.vcard-wrapper .vcard:visible').hide();
                wrapper.find('.vcard-wrapper .no-vcard-selected:hidden').show();
            }
            wrapper.find('#lookup-more-button').click(function () {
                button = lessButton;
                datatable.fnFilter($('.dataTables_filter > input').val());
            });
            wrapper.find('#lookup-less-button').click(function () {
                button = moreButton;
                datatable.fnFilter($('.dataTables_filter > input').val());
            });
        },
        "fnServerData": function (sSource, aoData, fnCallback) {
            var sEcho;
            var query;
            var start;
            var limit;

            $.each(aoData, function() {
                if (this.name == "sEcho") {
                    sEcho = this.value;
                }
                else if (this.name == "sSearch") {
                    query = this.value;
                    if(firstLookup) {
                        query = getLookupValue();
                        firstLookup = false;
                    }
                }
                else if (this.name == "iDisplayStart") {
                    start = this.value;
                }
                else if (this.name == "iDisplayLength") {
                    limit = this.value;
                }
            });

            if (collectionID == undefined) {
                collectionID = '-1';
            }

            if (sEcho == undefined) {
                sEcho = '';
            }

            if (query == undefined) {
                query = '';
            }

            if (start == undefined) {
                start = '0';
            }

            if (limit == undefined) {
                limit = '0';
            }

            if (button == lessButton) {
                limit = '20';
            }
            if (button == moreButton) {
                limit = '10';
            }


            var data = [];
            data.push({"name": "query", "value": query});
            data.push({"name": "collection", "value": collectionID});
            data.push({"name": "start", "value": start});
            data.push({"name": "limit", "value": limit});

            var $this = $(this);

            $.ajax({
                cache: false,
                url: sSource,
                dataType: 'xml',
                data: data,
                success: function (data) {
                    /* Translate AC XML to DT JSON */
                    var $xml = $(data);
                    var aaData = [];
                    $.each($xml.find('Choice'), function() {
                        // comes from org.dspace.content.authority.SolrAuthority.java
                        var choice = this;

                        var row = [];
                        var rowData = {};

                        for(var k = 0; k < choice.attributes.length; k++) {
                            var attr = choice.attributes[k];
                            rowData[attr.name] = attr.value;
                        }

                        var label = rowData.value;
                        if(rowData[rowLabel] != null) {
                            label = rowData[rowLabel];
                        }
                        row.push(label);
                        row.push(rowData);
                        aaData.push(row);

                    });

                    var nbFiltered = $xml.find('Choices').attr('total');

                    var total = $this.data('totalNbPeople');
                    if (total == undefined || (total * 1) < 1) {
                        total = nbFiltered;
                        $this.data('totalNbPeople', total);
                    }

                    var json = {
                        "sEcho": sEcho,
                        "iTotalRecords": total,
                        "iTotalDisplayRecords": nbFiltered,
                        "aaData": aaData
                    };
                    fnCallback(json);
                }
            });
        }
    });

    function getLookupValue(){
        var initialInput = "";
        if (authorityInput.indexOf('value_') != -1) { // edit item
            initialInput = $('textarea[name=' + authorityInput + ']').val();
        } else {   // submission
            var lastName = $('input[name=' + authorityInput + '_last]');
            var firstName = $('input[name=' + authorityInput + '_first]');
            if (lastName.size() && lastName.val() !== "") { // author input type
                initialInput = lastName.val();
                if (firstName.size() && firstName.val() !== ""){
                    initialInput = initialInput + ", " + firstName.val();
                }
                initialInput = initialInput.trim();
            } else { // other input types
                initialInput = $('input[name=' + authorityInput + ']').val();
            }
        }
        return initialInput;
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//only show the lookup button for the selected field on the edit item metadata page
(function ($) {
    $(document).ready(function () {
        renderMainLookup();

        $("#aspect_administrative_item_EditItemMetadataForm_field_field").change(function () {
            renderMainLookup();
        });

        function renderMainLookup() {
            var selectedField = $('#aspect_administrative_item_EditItemMetadataForm_field_field option:selected').text();
            var foundAuthorityControlledField = false;
            $('#aspect_administrative_item_EditItemMetadataForm_list_addItemMetadata button[name^="lookup_"]').each(function () {
                var name = 'lookup_' + selectedField.replace(".", "_").replace(".", "_");
                if($(this).attr('name') === name){
                    $(this).removeClass('hidden');
                    foundAuthorityControlledField = true;
                }
                else {
                    $(this).addClass('hidden');
                }
            });
            $('#aspect_administrative_item_EditItemMetadataForm_field_value').prop('readonly', foundAuthorityControlledField);
            $('#aspect_administrative_item_EditItemMetadataForm_field_submit_add').attr('disabled', foundAuthorityControlledField);
        }
    });
})(jQuery);
