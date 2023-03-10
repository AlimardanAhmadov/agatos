# Generated by Django 4.1.7 on 2023-03-09 08:49

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='EmployeeCard',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=250)),
                ('since', models.CharField(max_length=50)),
                ('location', models.TextField()),
                ('profile_image', models.ImageField(upload_to='')),
                ('encoded_image', models.TextField(blank=True, null=True)),
            ],
            options={
                'verbose_name': 'Employee Card',
                'verbose_name_plural': 'Employee Cards',
                'ordering': ['-id'],
            },
        ),
        migrations.AddIndex(
            model_name='employeecard',
            index=models.Index(fields=['id', 'name'], name='main_employ_id_106784_idx'),
        ),
    ]
