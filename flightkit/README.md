# FlightKit

A package containing webcomponents based on Avian CSS

## Component structure

### Tier0: base tier.

Tier0 is a component which has absolutely no inherited properties, but can be extended upon.

2 types available: 
- t0_%name%.js wich means it is a component to be exported
- t0_%name%_class.js wich means it is only to be used to extend.


So if something extends a t0, it will become a t1. if somehting extends from t1 it will become a t2 etc.
