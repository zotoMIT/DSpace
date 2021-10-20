# Local Dome Customizations

This repository holds only the files necessary to change a stock DSpace
application into the Dome platform maintained by the MIT Libraries.

These files are meant to be unzipped on top of a stock DSpace 6.3 codebase.

## Local development

Local development is best done via Docker, using this general workflow:

1. Clone the [DSpace repository](https://github.com/DSpace/DSpace), and check out the `dspace-6_x` branch.
2. Copy the contents of this `dome-mit-custom` repository over the top of that
   branch, overwriting and adding files as needed. Something like `cp -R *`
   should work.
3. Follow the [standard Docker workflow](https://github.com/DSpace/DSpace/tree/dspace-6_x/dspace/src/main/docker-compose) for building and starting the
   application. It will appear by default at [localhost:8080/xmlui](localhost:8080/xmlui).

## Theme

The theme for this application, `mit-fol`, is based on the MIT Libraries'
design system. Where possible, we should copy the stylesheets from that system
without alteration, and then store customizations in the basic `_style.scss`
file.
