(function ($) {
    
    $(document).ready(function (event) {
        
        if ($('body.change-list').length > 0) {
            var orderHeader = $('thead th:contains(Order)'),
                orderFields = $('input[name$="-order"]'),
                orderCells = orderFields.closest('td');
            
            orderHeader.hide();
            orderCells.hide();
            
            $('div#changelist tbody tr th').hover(function(){
              $(this).css({cursor:'move'});
            }, function(){
              $(this).css({cursor:'normal'});
            }).attr('title', 'drag to re-order');
            $('div#changelist tbody').sortable({
                items: 'tr',
                handle: 'th:first',
                update: function () {
                    var rows = $(this).find('tr');
                    
                    rows.each(function (i) {
                        var row = $(this),
                            orderField = row.find('input[name$="-order"]'),
                            oldValue = orderField.val(),
                            newValue = i + 1;
                        
                        if (oldValue != newValue) {
                            row.addClass('updated-order');
                            orderField.val(i + 1);
                        }
                    });
                    
                    rows.filter(':odd').addClass('row2').removeClass('row1');
                    rows.filter(':even').addClass('row1').removeClass('row2');
                }
            });
            
            window.onbeforeunload = function (event) {
                // TODO: Make sure that explicitOriginalTarget is standard API for this event.
                if ($('.updated-order').length > 0 && $(event.explicitOriginalTarget).is(':not(:submit)')) {
                    var verboseNamePlural = 'objects';
                    if ($('#verbose-name-plural').length == 1) {
                        verboseNamePlural = $('#verbose-name-plural').text();
                    }
                    return 'You have updated the order of your ' + verboseNamePlural + '.';
                }
            }
        }
        
        if ($('body.change-form').length > 0) {
            $('.orderable').each(function (i) {
                var inline = $(this);
                
                // Tabular Inlines
                if (inline.is(':has(.tabular)')) {
                    // Hide the unnecessary, ordering fields.
                    inline.find('th:contains(Order)').hide();
                    inline.find('td.original').hide();
                    inline.find('input[name$="-order"]').closest('td').hide();
                    inline.find('tbody tr.has_original').removeClass('has_original');
                    // Only allow ordering on existing objects
                    var items = inline.find('tr:visible:not(.add-row,.empty-form) td.original input[type=hidden][name$=-id][value!=]').parents('tr')
                    items.css('cursor', 'move')
                    inline.find('tbody').sortable({
                        items: items,
                        update: function (event, ui) {
                            items.each(function (i) {
                                var row = $(this),
                                    orderField = row.find('input[name$="-order"]');
                                orderField.val(i + 1);
                            });
                            rows.filter(':even').addClass('row1').removeClass('row2');
                            rows.filter(':odd').addClass('row2').removeClass('row1');
                        }
                    });
                }
                // Stacked Inlines
                else {
                    inline.find('.form-row.order').hide();
                    // Only allow ordering on existing objects
                    var items = inline.find('.inline-group input[type=hidden][name$=-id][value!=]').parents('.inline-related')
                    console.log(items)
                    items.find('h3').css('cursor','move')
                    inline.find('.inline-group').sortable({
                        items: items,
                        handle: 'h3',
                        update: function (event, ui) {
                            var forms = inline.find('.inline-related');
                            forms.each(function (i) {
                                var form = $(this),
                                    orderField = form.find('input[name$="order"]');
                                orderField.val(i + 1);
                            });
                        }
                    });
                }
                
            });
        }
        
    });
    
})(jQuery);
