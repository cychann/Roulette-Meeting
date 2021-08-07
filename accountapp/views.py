from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.views.generic import CreateView, DetailView, UpdateView, DeleteView
from django.urls import reverse_lazy

from accountapp.forms import RegisterForm, passwordUpdateForm, usernameUpdateForm
from accountapp.models import UserModel

# Create your views here.


def homePage(request):
    return render(request, 'base.html')


class accountCreateView(CreateView):
    model = UserModel
    form_class = RegisterForm
    success_url = reverse_lazy('home')
    template_name = 'accountapp/create.html'


class accountDetailView(DetailView):
    model = UserModel
    context_object_name = 'target_user'
    template_name = 'accountapp/detail.html'


class passwordUpdateView(UpdateView):
    model = UserModel
    form_class = passwordUpdateForm
    context_object_name = 'target_user'
    success_url = reverse_lazy('home')
    template_name = 'accountapp/update_password.html'

    def get(self, *args, **kwargs):
        if self.request.user.is_authenticated and self.get_object() == self.request.user:
            return super().get(*args, **kwargs)
        else:
            return HttpResponseForbidden()


class usernameUpdateView(UpdateView):
    model = UserModel
    form_class = usernameUpdateForm
    context_object_name = 'target_user'
    success_url = reverse_lazy('home')
    template_name = 'accountapp/update_username.html'

    def get(self, *args, **kwargs):
        if self.request.user.is_authenticated and self.get_object() == self.request.user:
            return super().get(*args, **kwargs)
        else:
            return HttpResponseForbidden()


class accountDeleteView(DeleteView):
    model = UserModel
    context_object_name = 'target_user'
    success_url = reverse_lazy('home')
    template_name = 'accountapp/delete.html'

    def get(self, *args, **kwargs):
        if self.request.user.is_authenticated and self.get_object() == self.request.user:
            return super().get(*args, **kwargs)
        else:
            return HttpResponseForbidden()
