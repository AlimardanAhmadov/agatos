# Generated by Django 4.1.7 on 2023-03-11 10:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0007_remove_employeecard_main_employ_id_106784_idx_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='employeecard',
            name='location',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='employeecard',
            name='position',
            field=models.CharField(blank=True, max_length=250, null=True),
        ),
        migrations.AlterField(
            model_name='employeecard',
            name='since',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
