from django.shortcuts import render
from .models import EmployeeCard


def home(request):
    context = {
        'cards': EmployeeCard.objects.all()
    }
    return render(request, 'main/base.html', context)