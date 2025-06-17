import React, { useState, useEffect } from 'react';
import ContactForm from './ContactForm';
import ListForm from './ListForm';
import ContactLists from './ContactList';
import { ContactListItem } from './ContactListItem';
import { useContacts } from '../../hook/contact-hook';
import { ContactListFrontend } from './ContactList';
import { ContactFrontend } from './ContactListItem';

function toContactFrontend(contact: any): ContactFrontend {
  return {
    ...contact,
    owner: contact.owner || '',
    addedAt: contact.addedAt ? new Date(contact.addedAt) : new Date(),
    lists: contact.lists || [], // Add this line
  };
}
function toContactListFrontend(list: any): ContactListFrontend {
  return {
    ...list,
    owner: list.owner || '',
    createdAt: list.createdAt ? new Date(list.createdAt) : new Date(),
  };
}

const ContactsView = () => {
  const {
    lists,
    contacts,
    selectedList,
    loading,
    error,
    fetchListContacts,
    createList,
    deleteList,
    createContact,
    updateContact,
    deleteContact,
    setSelectedList,
    searchUsers,
    searchResults,
    isSearching,
    clearSearch,
  } = useContacts();

  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [listFormOpen, setListFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleListSelect = async (listId: string) => {
    const found = lists.find(l => l.id === listId);
    if (found) {
      await fetchListContacts(listId);
    }
  };

  const handleSelectAllContacts = () => {
    setSelectedList(null);
  };

  const getContactsTitle = () => {
    if (selectedList) {
      const list = lists.find(l => l.id === selectedList.id);
      return `${list?.name || 'List'} Contacts`;
    }
    return 'All Contacts';
  };

  const displayedContacts = selectedList
    ? selectedList.contacts || [] 
    : contacts;

  const listsFrontend = lists.map(toContactListFrontend);
  const displayedContactsFrontend = displayedContacts.map(toContactFrontend);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 border-r border-base-300 flex flex-col max-h-[calc(100vh-2rem)] sticky top-4 ml-4 mt-4 rounded-xl shadow-sm bg-success">
        <div className="flex-1 overflow-y-auto p-4">
          <ContactLists
            lists={listsFrontend}
            selectedList={selectedList?.id || null}
            onSelect={handleListSelect}
            onDelete={deleteList}
            onSelectAll={handleSelectAllContacts}
          />
        </div>
        <div className="p-4 border-t border-base-300">
          <button 
            className="btn btn-primary w-full"
            onClick={() => setListFormOpen(true)}
          >
            New List
          </button>
        </div>
      </div>
      {/* Main content */}
      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {getContactsTitle()}
          </h2>
          <button 
            className="btn btn-accent"
            onClick={() => setContactFormOpen(true)}
          >
            Add Contact
          </button>
        </div>
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center mt-10">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <ul className="space-y-2">
            {displayedContactsFrontend.map((contact) => (
              <ContactListItem
                key={contact.id}
                contact={contact}
                lists={listsFrontend}
                onUpdate={updateContact}
                onDelete={deleteContact}
                currentListId={selectedList?.id}
              />
            ))}
          </ul>
        )}
      </div>
      {/* Modals */}
      <ContactForm
        open={contactFormOpen}
        onClose={() => setContactFormOpen(false)}
        onSubmit={createContact}
        lists={listsFrontend}
      />
      <ListForm
        open={listFormOpen}
        onClose={() => setListFormOpen(false)}
        onSubmit={createList}
      />
    </div>
  );
};

export default ContactsView;
