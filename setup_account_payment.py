#!/usr/bin/env python
import argparse
import stripe

#Stripe account requires activation before payments can be accepted. To activate the account, a product website, EIN, and bank account must be provided
#Until the required information is provided to stripe, this script will not create recurring subscription payments
parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
parser.add_argument('--customer_email', required=True)
parser.add_argument('--cardNum', required=True)

args=parser.parse_args(arguments)

stripe.api_key = "test key"
#Once the account is activated replace this key

plan = stripe.Plan.create(
  product='product_key', #replace this with the product ID created from create_product.py
  nickname='Anchor subscription',
  interval='month',
  currency='usd',
  amount=2, #this should correspond to the monthly price to host a website using our web hosting service ($1-$3/month using AWS)
)

src=stripe.createSource(cardNum)

customer = stripe.Customer.create(
  email=customer_email,
  source=src,
)

stripe.Subscription.create(
  customer=customer,
  items=[{'plan': plan}],
)