from django.shortcuts import render
# from catalog.models import Book, Author, BookInstance, Genre

def index(request):
    """View function for home page of site."""
    # Render the HTML template index.html with the data in the context variable
    return render(request, 'blog-default.html')