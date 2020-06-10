import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { Item } from  '../models/Item'
import { ItemUpdate } from  '../models/ItemUpdate'

const AWS = require('aws-sdk')
const AWSX = useAWSX()

// Read env variables
const TABLENAME : string = process.env.ITEMS_TABLE
const INDEXNAME: string = process.env.INDEX_NAME
const s3BucketName = process.env.ATTACHMENT_S3_BUCKET

const logger = createLogger('dataLayer-itemsAccess')

export class ItemsAccess {
  constructor(
    private readonly documentClient: DocumentClient = createDocumentClient(),
  ) {}
   
  

  async createItem(item : Item): Promise<Item> {
    const params = {
      TableName : TABLENAME,
      Item: item
    }
      
    logger.info('Uploading new item to database')
    await this.documentClient.put(params).promise()
    return item
  }

  async getUserItems(userId: string) : Promise<any>{
    const params = {
      TableName: TABLENAME,
      IndexName: INDEXNAME,
      KeyConditionExpression: 'userId = :loggedInUser',
      ExpressionAttributeValues: {
        ':loggedInUser': userId,
      }
    }
    logger.info('Getting all user items')
    const items = await this.documentClient.query(params).promise()
    logger.info('Got all user items', items)
    return items
  }

  async getFeed() : Promise<any>{
    var params = {
      TableName : TABLENAME,
    }
    const items = await this.documentClient.scan(params).promise()
    logger.info('Get all items', items)
    return items
  }

  async deleteItem(itemId : string): Promise<any> {
    // First find the createdAt field for the item, since it is part of the composite key
    const paramsGet = {
      TableName: TABLENAME,
      KeyConditionExpression: 'itemId = :itemIddelete',
      ExpressionAttributeValues: {
        ':itemIddelete': itemId,
      }
    }
    console.log(paramsGet)
    logger.info('getting item')
    const item = await this.documentClient.query(paramsGet).promise()
    logger.info('retrieved item', item)

    const paramsDelete = {
      TableName : TABLENAME,
      Key: {
        itemId: itemId,
        createdAt: item.Items[0].createdAt
      }
    };
    logger.info('deleting item', item)
    await this.documentClient.delete(paramsDelete).promise()
    logger.info('item deleted', item)
    return item
  }



  async updateItem(itemId: string, updatedItem: ItemUpdate): Promise<ItemUpdate>{
    const paramsGet = {
      TableName: TABLENAME,
      KeyConditionExpression: 'itemId = :itemIddelete',
      ExpressionAttributeValues: {
        ':itemIddelete': itemId,
      }
    }
    logger.info('Getting item')
    const item = await this.documentClient.query(paramsGet).promise()
    logger.info('Item Retrieved')

    var params = {
      TableName: TABLENAME,
      Key: { 
        itemId : itemId, 
        createdAt: item.Items[0].createdAt 
      },
      UpdateExpression: 'set #name = :updatedName, #description = :updatedDescription, #contact = :updatedContact',
      ExpressionAttributeNames: {'#name' : 'name', '#description': 'description', '#contact': 'contact'},
      ExpressionAttributeValues: {
        ':updatedName' : updatedItem.name,
        ':updatedDescription' : updatedItem.description,
        ':updatedContact' : updatedItem.contact,
      }
    };
    logger.info('Updating item')
    await this.documentClient.update(params).promise();
    logger.info('Item updated')
    return updatedItem
  }

  async updateAttachmentUrl(itemId: string) {
    const paramsGet = {
      TableName: TABLENAME,
      KeyConditionExpression: 'itemId = :toUpdate',
      ExpressionAttributeValues: {
        ':toUpdate': itemId,
      }
    }
    const item = await this.documentClient.query(paramsGet).promise()
    logger.info('get item', item)

    const url = `https://${s3BucketName}.s3.eu-central-1.amazonaws.com/${itemId}`
  
    var params = {
      TableName: TABLENAME,
      Key: { 
        itemId : itemId, 
        createdAt: item.Items[0].createdAt 
      },
      UpdateExpression: 'set #attachmentUrl = :updatedUrl',
      ExpressionAttributeNames: {'#attachmentUrl' : 'attachmentUrl'},
      ExpressionAttributeValues: {
        ':updatedUrl' : url
      }
    }
    await this.documentClient.update(params).promise();
    
    return url
  }
}

function createDocumentClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Create a local DynamoDB instance')
    return new AWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  } else {
    return new AWSX.DynamoDB.DocumentClient()
  }
}

function useAWSX() {
  // Disable AWS-XRAY in local mode to prevent runtime error
  if (process.env.IS_OFFLINE) {
    return undefined
  } else {
    const AWSXRay = require('aws-xray-sdk')
    const AWSX = AWSXRay.captureAWS(AWS)
    return AWSX
  }
}