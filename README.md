# Django POC for multi-tenant support

## Development setup
- Installing dependencies
```bash
pip install -r requirements.txt
```
- Moving static resources
```bash
python manage.py collectstatic
```
- Running the application
```
python manage.py runserver
```
- 
```
ALLOWED_HOSTS = [
    `press.test-domain.com`,
    `blog.test-domain.com`
]
```

## Learnings
- Used the django-admin tool to generate basic project structure
- blog is the main application here
- CMS_PERMISSION = True // Enable for editing pages
- Use following command to create a user
```python
python manage.py createsuperuser
```
- [Create a super user](https://stackoverflow.com/questions/11337420/can-i-use-an-existing-user-as-django-admin-when-enabling-admin-for-the-first-tim)
- For accordion, djangocms-accordion is used. Now djangocms-accordion only work with jQuery, so included jQuery directly from CDN