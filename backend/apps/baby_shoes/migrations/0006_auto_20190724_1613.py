# Generated by Django 2.2.3 on 2019-07-24 16:13

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('baby_shoes', '0005_studentresponse_views'),
    ]

    operations = [
        migrations.AlterField(
            model_name='studentresponse',
            name='student',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='student_responses', to='baby_shoes.Student'),
        ),
    ]