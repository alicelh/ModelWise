# Entry point for the application.
from . import app  # For application discovery by the 'flask' command. 

# all the view(routes) functions (the ones with a route() decorator on top)
# have to be imported in the __init__.py file. Not the object itself, but
# the module it is in. Import the view module after the application object 
# is created.
from . import routes # For import side-effects of setting up routes. 