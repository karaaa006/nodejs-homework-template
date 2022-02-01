const fs = require("fs/promises");
const path = require("path");
const { v4 } = require("uuid");

const contactsPath = path.join(__dirname, "contacts.json");

const listContacts = async () => {
  const data = await fs.readFile(contactsPath);
  const result = JSON.parse(data);

  return result;
};

const getContactById = async (contactId) => {
  const contactsArray = await listContacts();
  const result = contactsArray.find(
    (contact) => contact.id === contactId.toString()
  );

  if (!result) return null;

  return result;
};

const removeContact = async (contactId) => {
  const contactsArray = await listContacts();
  const idx = contactsArray.findIndex(
    (contact) => contact.id === contactId.toString()
  );
  if (idx === -1) return null;

  const removedContact = contactsArray[idx];
  contactsArray.splice(idx, 1);

  await fs.writeFile(contactsPath, JSON.stringify(contactsArray, null, 2));

  return removedContact;
};

const addContact = async (body) => {
  const contactsArray = await listContacts();
  const newContact = {
    id: v4(),
    ...body,
  };
  contactsArray.push(newContact);
  await fs.writeFile(contactsPath, JSON.stringify(contactsArray, null, 2));
  return newContact;
};

const updateContact = async (contactId, body) => {
  const contacts = await listContacts();
  const idx = contacts.findIndex((item) => item.id === contactId);
  if (idx === -1) return null;

  const { name, phone, email } = body;

  contacts[idx] = { id: contactId, name, phone, email };
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));

  return contacts[idx];
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
