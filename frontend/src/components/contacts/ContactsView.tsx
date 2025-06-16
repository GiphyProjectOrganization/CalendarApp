import React, { useState, useEffect } from 'react';
import ContactForm from './ContactForm';
import ListForm from './ListForm';
import ContactLists from './ContactList';
import { ContactListItem } from './ContactListItem';
import { useContacts } from '../../hook/contact-hook';

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
    setSelectedList(listId);
    await fetchListContacts(listId);
  };

  const displayedContacts = selectedList
    ? selectedList.contacts || [] 
    : contacts;

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Sidebar */}
      <div className="w-72 p-4 border-r border-base-300 overflow-y-auto">
        <ContactLists
          lists={lists}
          selectedList={selectedList}
          onSelect={handleListSelect}
          onDelete={deleteList}
        />
        <button 
          className="btn btn-primary w-full mt-4"
          onClick={() => setListFormOpen(true)}
        >
          New List
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {selectedList 
              ? lists.find(l => l._id === selectedList)?.name || 'Contacts'
              : 'All Contacts'}
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
            {displayedContacts.map((contact) => (
              <ContactListItem
                key={contact.id}
                contact={contact}
                lists={lists}
                onUpdate={updateContact}
                onDelete={deleteContact}
                currentListId={selectedList}
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
        lists={lists}
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
