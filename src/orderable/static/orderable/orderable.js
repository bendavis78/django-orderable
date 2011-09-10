(function ($) {
    
    $(document).ready(function (event) {
        
        if ($('body.change-list').length > 0) {
            var orderHeader = $('thead th:contains('+ORDERING_FIELD_LABEL+')'),
                orderFields = $('input[name$="-'+ORDERING_FIELD+'"]'),
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
                            orderField = row.find('input[name$="-'+ORDERING_FIELD+'"]'),
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
                var prefix = $(this).find('.inline-group').attr('id').replace('-group', '');
                
                // Tabular Inlines
                if (inline.is(':has(.tabular)')) {
                    // Hide the unnecessary, ordering fields.
                    inline.find('th:contains('+INLINE_ORDERING_FIELDS[prefix].label+')').hide();
                    inline.find('input[name$="-'+INLINE_ORDERING_FIELDS[prefix].name+'"]').closest('td').hide();
                    inline.find('tbody tr.has_original').removeClass('has_original');
                    // Make sure first TH is colspan=2
                    inline.find('th:visible:first').attr('colspan','2');
                    // Only allow ordering on existing objects
                    var selector = 'tr:visible:not(.add-row,.empty-form) td.original input[type=hidden][name$=-id][value!=]';
                    var items = inline.find(selector).parents('tr')
                    items.css('cursor', 'move')
                    inline.find('tbody').sortable({
                        items: items,
                        update: function (event, ui) {
                            $.fn.reverse = [].reverse // quick reverse hack
                            var rows = inline.find(selector).parents('tr').reverse()
                            rows.each(function (i) {
                                var row = $(this),
                                    orderField = row.find('input[name$="-'+INLINE_ORDERING_FIELDS[prefix].name+'"]');
                                orderField.val(i + 1);
                            });
                            rows.filter(':even').addClass('row1').removeClass('row2');
                            rows.filter(':odd').addClass('row2').removeClass('row1');
                        }
                    });
                }
                // Stacked Inlines
                else {
                    inline.find('.form-row.'+INLINE_ORDERING_FIELDS[prefix].name).hide();
                    // Only allow ordering on existing objects
                    var selector = '.inline-group input[type=hidden][name$=-id][value!=]';
                    var items = inline.find(selector).parents('.inline-related')
                    items.find('h3').css('cursor','move')
                    inline.find('.inline-group').sortable({
                        items: items,
                        handle: 'h3',
                        update: function (event, ui) {
                            $.fn.reverse = [].reverse // quick reverse hack
                            var forms = inline.find(selector).parents('.inline-related').reverse()
                            forms.each(function (i) {
                                var form = $(this),
                                    orderField = form.find('input[name$="'+INLINE_ORDERING_FIELDS[prefix].name+'"]');
                                orderField.val(i + 1);
                            });
                        }
                    });
                }
                
            });
        }
        
    });
    
})(jQuery);
