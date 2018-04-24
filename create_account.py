#!/usr/bin/env python
from __future__ import print_function
import boto3
import botocore
import time
import sys
import argparse

#USAGE: python create_account.py --account_name [name] --account_email [email]

#NOTE: This code will was used to create a number of test accounts on the Anchor-Test 
#organization, however the organization is not allowed to create any additional accounts 
#and this will now return an error when run. AWS recommends contacting customer service
#to fix this issue, but it may be a better idea to just switch over to an alternative
#hosting service.


def createNewAccount(accountName, accountEmail):
	client = boto3.client('organizations')
	organization_unit_id='o-tcc5yg883g'

	print("Trying create Account...")
	try:
		create_account_response = client.create_account(Email=accountEmail, AccountName=accountName,RoleName='OrganizationAccountAccessRole',IamUserAccessToBilling="DENY")
	except botocore.exceptions.ClientError as e:
		print(e)
		sys.exit(1)
	time.sleep(10)

	print("Account creation in progress...")
	account_status = 'IN_PROGRESS'

	create_account_status_response = client.describe_create_account_status(CreateAccountRequestId=create_account_response.get('CreateAccountStatus').get('Id'))
	ID=create_account_status_response.get('CreateAccountStatus').get('AccountId')
	print("Account created with ID "+ID)
	root_id = client.list_roots().get('Roots')[0].get('Id')
	print("Root id: "+root_id)

	print("Success. Moving account to organization")

	try:
		move_account_response = client.move_account(AccountId=account_id, SourceParentId=root_id, DestinationParentId=organization_unit_id)
	except Exception as ex:
		template = "An exception of type {0} occurred. Arguments:\n{1!r} "
		message = template.format(type(ex).__name__, ex.args)
	    # create_organizational_unit(organization_unit_id)
		print(message)
	print("Success")

def main(arguments):
	parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
	parser.add_argument('--account_name', required=True)
	parser.add_argument('--account_email', required=True)

	args=parser.parse_args(arguments)
	createNewAccount(args.account_name,args.account_email)
	print('Account Created')

if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))