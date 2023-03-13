import io, base64
from django.db import models
from django.db.models.signals import post_save, post_delete
from django.core.cache import cache
from django.contrib.auth import get_user_model
from model_utils import FieldTracker
from PIL import Image

from .compress_image import compress_image

CACHED_CARD_BY_USERNAME_KEY = 'card__by_username__{}'
CACHE_LENGTH = 24 * 3600  # --> 24hrs

User = get_user_model()

class NotFound:
    """ caching """


class EmployeeCard(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee')
    position = models.CharField(max_length=250, blank=True, null=True)
    since = models.CharField(max_length=50, blank=True, null=True)
    location = models.TextField(blank=True, null=True)
    profile_image = models.ImageField(blank=True, null=True)
    encoded_image = models.TextField(blank=True, null=True)
    qr_code = models.ImageField(blank=True, null=True)
    encoded_qr_qode = models.TextField(blank=True, null=True)

    tracker=FieldTracker()

    class Meta:
        verbose_name = 'Employee Card'
        verbose_name_plural = 'Employee Cards'
        indexes = [models.Index(fields=['id',])]
        ordering = ['-id']
    
    def save(self, *args, **kwargs):
        profile_image = self.tracker.has_changed('profile_image')
        
        image = self.profile_image
        qr_code = self.qr_code

        if profile_image:
            if image and image.size > (0.3 * 1024 * 1024):
                image = compress_image(image)

            img = Image.open(image)
            converted_img = img.convert('RGB')

            data = io.BytesIO()
            converted_img.save(data, "JPEG")
            encoded_img = base64.b64encode(data.getvalue())
            decoded_img = encoded_img.decode('utf-8')
            img_data = f"data:image/jpeg;base64,{decoded_img}"
            if img_data:
                self.encoded_image = img_data

                if self.encoded_image != '':
                    self.profile_image = None
        
        if qr_code:
            img = Image.open(qr_code)
            converted_img = img.convert('RGB')

            data = io.BytesIO()
            converted_img.save(data, "JPEG")
            encoded_img = base64.b64encode(data.getvalue())
            decoded_img = encoded_img.decode('utf-8')
            img_data = f"data:image/jpeg;base64,{decoded_img}"
            if img_data:
                self.encoded_qr_qode = img_data

                if self.encoded_qr_qode != '':
                    self.qr_code = None

        super(EmployeeCard, self).save(*args, **kwargs)

    @staticmethod
    def cache_by_username(username):
        key = CACHED_CARD_BY_USERNAME_KEY.format(username)

        card = cache.get(key)
        if card:
            if isinstance(card, NotFound):
                return None
            return card

        card = EmployeeCard.objects.filter(models.Q(user__username=username)).first()

        if not card:
            cache.set(key, NotFound(), CACHE_LENGTH)
            return None

        cache.set(key, card, CACHE_LENGTH)
        return card

    @staticmethod
    def invalidate_card_cache(sender, instance, **kwargs):
        """
        Invalidate the employee card cached data when it is updated or deleted
        """
        print("employee product card deleting cache")
        cache.delete(CACHED_CARD_BY_USERNAME_KEY.format(instance.user.username))

    def __str__(self):
        return self.user.email


post_save.connect(EmployeeCard.invalidate_card_cache, sender=EmployeeCard)
post_delete.connect(EmployeeCard.invalidate_card_cache, sender=EmployeeCard)
