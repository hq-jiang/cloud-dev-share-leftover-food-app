import { CreateItemRequest } from '../requests/CreateItemRequest'
import { ItemsAccess } from '../dataLayer/itemsAccess'
import { Item } from '../models/Item'
import { v4 } from 'uuid';
import { createLogger } from '../utils/logger';
import { UpdateItemRequest } from '../requests/UpdateItemRequest'

const logger = createLogger('BusinessLogic-todo')

const itemsAccess = new ItemsAccess()

export async function getFeed(): Promise<any>{
  logger.info('Query db for todos')

  const todos = await itemsAccess.getFeed()
  return todos
}

export async function createItem(newItem: CreateItemRequest, userId: string): Promise<Item> {

  const item: Item = {
      ...newItem,
      userId: userId,
      itemId: v4(),
      createdAt: new Date().toISOString(),
    }
    logger.info('New item instantiated', item)
  
    await itemsAccess.createItem(item)

  return item
}

export async function deleteItem(itemId: string): Promise<any>{
  
  const item = await itemsAccess.deleteItem(itemId)
  return item
}

export async function getUserItems(userId: string): Promise<any>{
  logger.info('Query db for items')

  const items = await itemsAccess.getUserItems(userId)
  return items
}

export async function updateItem(todoId: string, updatedItem: UpdateItemRequest) {
  logger.info('update body', updatedItem)
  const updateditem = await itemsAccess.updateItem(todoId, updatedItem)
  return updateditem
}

export async function updateAttachmentUrl(itemId: string): Promise<string> {
  logger.info('update attachmentUrl')
  const attachmentUrl = await itemsAccess.updateAttachmentUrl(itemId)
  logger.info('attachmentUrl', attachmentUrl)
  return attachmentUrl
}