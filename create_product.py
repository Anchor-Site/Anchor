#!/usr/bin/env python
import stripe

#Stripe account requires activation before payments can be accepted. To activate the account, a product website, EIN, and bank account must be provided
#Until the required information is provided to stripe, this script will not create recurring subscription payments

stripe.api_key = "test key"
#Once the account is activated replace this key

product = stripe.Product.create(
  name='Anchor Web Hosting',
  type='service',
)
print("Product created with ID "+product)