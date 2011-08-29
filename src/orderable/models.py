from django.core.exceptions import ObjectDoesNotExist
from django.db.models.fields import FieldDoesNotExist
from django.db import models

class OrderableModelBase(models.base.ModelBase):
    """
    Metaclass which adds the configured field to the model if it does not exist.
    """
    def __new__(cls, name, bases, attrs):
        model = models.base.ModelBase.__new__(cls, name, bases, attrs)
        # don't do anything if this is the abstract model
        if model._meta.abstract:
            return model
        # add ordering field if it does not exist on the model
        try:
            model._meta.get_field(model.ordering_field)
        except FieldDoesNotExist:
            ordering_field = models.PositiveIntegerField(db_index=True, blank=True, null=True)
            model.add_to_class(model.ordering_field, ordering_field)
        # Add Meta.ordering if it has not been explicitly specified
        if not model._meta.ordering:
            model._meta.ordering = (model.ordering_field,)
        return model

class OrderableModel(models.Model):
    """
    Provides basic facilities for ordered model instances.
    """
    __metaclass__ = OrderableModelBase
    ordering_field = 'order'

    def _get_ordering_queryset(self):
        """
        Returns the queryset used for model ordering. 
        
        This can helpful (or even required) in some special cases, such as
        using model inheritance or polymorphic model implementations where the
        models returned by the default manager are not necessarily those that
        should be ordered on.
        """
        return self.__class__._default_manager.all()
    
    def save(self, *args, **kwargs):
        """
        Save the current model instance, and set the model order if none has
        been previously set.
        """
        queryset = self._get_ordering_queryset()
        
        if getattr(self, self.ordering_field) is None:
            try:
                last_object = queryset.order_by('-%s' % self.ordering_field, '-id')[0:1].get()
                last_object_order = getattr(last_object, self.ordering_field)
                if last_object_order is not None:
                    setattr(self, self.ordering_field, last_object_order + 1)
            except ObjectDoesNotExist:
                pass
        
        # If we weren't able to set the order above, assume it's the first
        # object in order.
        if getattr(self, self.ordering_field) is None:
            setattr(self, self.ordering_field, 1)
        
        super(OrderableModel, self).save(*args, **kwargs)
    
    def get_previous(self, queryset=None):
        """
        Return the previous model in order (if available).
        
        Throws (or technically, allows to bubble up) the appropriate 
        ObjectDoesNotExist exception if the object does not exist.
        """
        if queryset is None:
            queryset = self._get_ordering_queryset()
        
        filter = {'%s__lt':getattr(self, self.ordering_field)}
        return queryset.order_by('-%s' % self.ordering_field, '-id').filter(**filter)[0:1].get()

    def get_next(self, queryset=None):
        """
        Return the next model in order (if available).
        
        Throws (or technically, allows to bubble up) the appropriate 
        ObjectDoesNotExist exception if the object does not exist.
        """
        if queryset is None:
            queryset = self._get_ordering_queryset()
        
        filter = {'%s__gt':getattr(self, self.ordering_field)}
        return queryset.order_by(self.ordering_field, 'id').filter(**filter)[0:1].get()
    
    class Meta:
        abstract = True
