from django.urls import path
from . import views
from django.contrib import admin
from django.conf.urls.i18n import i18n_patterns
from django.conf.urls import include, url

admin.autodiscover()

urlpatterns = [
    # path('', views.index, name='index'),
    url(r'^', include('cms.urls'))
]

# urlpatterns += i18n_patterns(
    # url(r'^', include('cms.urls')),
    # prefix_default_language=False
# )