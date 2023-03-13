# Generated by Django 4.1.7 on 2023-03-11 08:52

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('main', '0006_remove_employeecard_user'),
    ]

    operations = [
        migrations.RemoveIndex(
            model_name='employeecard',
            name='main_employ_id_106784_idx',
        ),
        migrations.RemoveField(
            model_name='employeecard',
            name='name',
        ),
        migrations.AddField(
            model_name='employeecard',
            name='user',
            field=models.OneToOneField(default=True, on_delete=django.db.models.deletion.CASCADE, related_name='employee', to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
        migrations.AddIndex(
            model_name='employeecard',
            index=models.Index(fields=['id'], name='main_employ_id_a09b0e_idx'),
        ),
    ]
