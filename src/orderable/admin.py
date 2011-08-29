from django.conf import settings
from django.contrib import admin
from django.contrib.admin.util import label_for_field
from django.core.exceptions import ImproperlyConfigured
from orderable.settings import JQUERY_URL, JQUERYUI_URL
from orderable import models
import posixpath

class OrderableAdmin(admin.ModelAdmin):
    change_list_template = 'orderable/change_list.html'

    class Media:
        js = (JQUERY_URL, JQUERYUI_URL,
              posixpath.join(settings.STATIC_URL, 'orderable/orderable.js'))
    
    def __init__(self, model, *args, **kwargs):
        if not issubclass(model, models.OrderableModel):    
            raise ImproperlyConfigured("OrderableAdmin may only be used with OrderableModel models")
        self.order_field = getattr(model, 'ordering_field')
        self.exclude = tuple(self.exclude or ()) + (self.order_field,)
        if not self.ordering:
            self.ordering = model._meta.ordering

        super(OrderableAdmin, self).__init__(model, *args, **kwargs)
        
        if self.order_field not in self.list_display:
            self.list_display = list(self.list_display) + [self.order_field]
        
        if self.order_field not in self.list_editable:
            self.list_editable = list(self.list_editable) + [self.order_field]

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        label = label_for_field(self.model.ordering_field, self.model, 
                                model_admin=self)
        extra_context.update({
            'ordering_field': self.model.ordering_field,
            'ordering_field_label': label
        })
        return super(OrderableAdmin, self).changelist_view(request, extra_context)

class OrderableInline(object):
    def __init__(self, parent_model, model_admin, **kwargs):
        if not issubclass(self.model, models.OrderableModel):
            raise ImproperlyConfigured("%s may only be used with OrderableModel models" % self.__class__.__name__)
        self.order_field = self.model.ordering_field
        self.order_field_label = label_for_field(self.model.ordering_field, 
                                                 self.model, model_admin)
        super(OrderableInline, self).__init__(parent_model, model_admin, **kwargs)

    class Media:
        js = (JQUERY_URL, JQUERYUI_URL,
              posixpath.join(settings.STATIC_URL, 'orderable/orderable.js'))

class OrderableStackedInline(OrderableInline, admin.StackedInline):
    template = 'orderable/edit_inline/stacked.html'

class OrderableTabularInline(OrderableInline, admin.TabularInline):
    template = 'orderable/edit_inline/tabular.html'
