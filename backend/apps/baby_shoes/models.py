from django.db import models


# Create your models here.
class BabyShoes(models.Model):
    story = models.TextField()

    def __str___(self):
        return self.story


class Context(models.Model):

    text = models.TextField()
    story = models.ForeignKey(BabyShoes, on_delete=models.CASCADE, related_name='contexts')

    def __str__(self):
        return self.text


class Question(models.Model):

    text = models.TextField()
    word_limit = models.IntegerField()
    story = models.ForeignKey(BabyShoes, on_delete=models.CASCADE, related_name='questions')


class Student(models.Model):

    pass


class StudentResponse(models.Model):

    response = models.TextField()
    views = models.IntegerField(default=0)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='student_responses')

