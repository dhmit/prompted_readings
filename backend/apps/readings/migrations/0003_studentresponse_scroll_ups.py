# Generated by Django 2.2.3 on 2019-08-02 14:55

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('readings', '0002_auto_20190801_1421'),
    ]

    operations = [
        migrations.AddField(
            model_name='studentresponse',
            name='scroll_ups',
            field=models.IntegerField(default=0),
        ),
    ]