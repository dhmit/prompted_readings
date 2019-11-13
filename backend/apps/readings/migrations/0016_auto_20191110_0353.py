# Generated by Django 2.2.4 on 2019-11-10 08:53

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('readings', '0015_auto_20191110_0332'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='segmentquestionresponse',
            name='student',
        ),
        migrations.AddField(
            model_name='segmentquestionresponse',
            name='student_reading_data',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='segment_responses', to='readings.StudentReadingData'),
            preserve_default=False,
        ),
    ]