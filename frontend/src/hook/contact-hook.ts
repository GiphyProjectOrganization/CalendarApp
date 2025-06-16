import { useState, useEffect, useCallback, useRef } from 'react';
interface Contact {
  id: string;
  userId: string;
  name: string;
  email: string;
  phoneNumber: string;
  photoBase64?: string;
  addedAt: string;
  lists: string[];
}
interface ContactList {
  id: string;
  name: string;
  isDefault: boolean;
  createdAt: string;
}
interface ContactListWithContacts extends ContactList {
  contacts: Contact[];
}

const API_BASE_URL = 'http://localhost:5000/api';

async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      ...options?.headers,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const useContacts = () => {
  const [state, setState] = useState<{
    lists: ContactList[];
    contacts: Contact[];
    selectedList: ContactListWithContacts | null;
    loading: boolean;
    error: string | null;
  }>({
    lists: [],
    contacts: [],
    selectedList: null,
    loading: false,
    error: null,
  });

  const abortControllers = useRef<AbortController[]>([]);

  // Cleanup pending
  useEffect(() => {
    return () => {
      abortControllers.current.forEach(controller => controller.abort());
    };
  }, []);
  
  //this handles errors
  const makeRequest = useCallback(async <T>(
    requestFn: (signal?: AbortSignal) => Promise<T>,
    {
      skipLoading = false,
      skipError = false,
    }: { skipLoading?: boolean; skipError?: boolean } = {}
  ): Promise<T> => {
    const controller = new AbortController();
    abortControllers.current.push(controller);

    try {
      !skipLoading && setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await requestFn(controller.signal);
      return result;
    } catch (err) {
      if (!skipError && !controller.signal.aborted) {
        const message = err instanceof Error ? err.message : 'Request failed';
        setState(prev => ({ ...prev, error: message }));
      }
      throw err;
    } finally {
      if (!controller.signal.aborted) {
        abortControllers.current = abortControllers.current.filter(c => c !== controller);
        !skipLoading && setState(prev => ({ ...prev, loading: false }));
      }
    }
  }, []);

  const fetchLists = useCallback(async () => {
    return makeRequest<ContactList[]>(async (signal) => {
      const lists = await fetchAPI<ContactList[]>('/contact-lists', { signal });
      setState(prev => ({ ...prev, lists }));
      return lists;
    });
  }, [makeRequest]);

  const fetchContacts = useCallback(async () => {
    return makeRequest<Contact[]>(async (signal) => {
      const contacts = await fetchAPI<Contact[]>('/contacts', { signal });
      setState(prev => ({ ...prev, contacts }));
      return contacts;
    });
  }, [makeRequest]);

  const fetchListContacts = useCallback(async (listId: string) => {
    return makeRequest<ContactListWithContacts>(async (signal) => {
      const listWithContacts = await fetchAPI<ContactListWithContacts>(
        `/contact-lists/${listId}/contacts`,
        { signal }
      );
      setState(prev => ({ ...prev, selectedList: listWithContacts }));
      return listWithContacts;
    });
  }, [makeRequest]);

  const createList = useCallback(async (name: string) => {
    return makeRequest<ContactList>(async () => {
      const newList = await fetchAPI<ContactList>('/contact-lists', {
        method: 'POST',
        body: JSON.stringify({ name }),
      });
      setState(prev => ({ ...prev, lists: [...prev.lists, newList] }));
      return newList;
    });
  }, [makeRequest]);

  const deleteList = useCallback(async (listId: string) => {
    return makeRequest<void>(async () => {
      await fetchAPI(`/contact-lists/${listId}`, { method: 'DELETE' });
      setState(prev => ({
        ...prev,
        lists: prev.lists.filter(list => list.id !== listId),
        selectedList: prev.selectedList?.id === listId ? null : prev.selectedList,
      }));
    });
  }, [makeRequest]);

  const createContact = useCallback(async (userId: string, listIds?: string[]) => {
    return makeRequest<void>(async () => {
      await fetchAPI('/contacts', {
        method: 'POST',
        body: JSON.stringify({ userId, listIds }),
      });
      await Promise.all([fetchContacts(), ...(listIds?.map(fetchListContacts) || [])]);
    });
  }, [makeRequest, fetchContacts, fetchListContacts]);

  const updateContact = useCallback(async (contactId: string, listIds: string[]) => {
    return makeRequest<void>(async () => {
      await fetchAPI(`/contacts/${contactId}/lists`, {
        method: 'PUT',
        body: JSON.stringify({ listIds }),
      });
      await Promise.all([
        fetchContacts(),
        state.selectedList && fetchListContacts(state.selectedList.id),
      ]);
    });
  }, [makeRequest, fetchContacts, fetchListContacts, state.selectedList]);

  const deleteContact = useCallback(async (contactId: string, listId?: string) => {
    return makeRequest<void>(async () => {
      const url = `/contacts/${contactId}${listId ? `?listId=${listId}` : ''}`;
      await fetchAPI(url, { method: 'DELETE' });
      await Promise.all([
        fetchContacts(),
        state.selectedList && fetchListContacts(state.selectedList.id),
      ]);
    });
  }, [makeRequest, fetchContacts, fetchListContacts, state.selectedList]);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      try {
        await makeRequest(async (signal) => {
          const [lists, contacts] = await Promise.all([
            fetchAPI<ContactList[]>('/contact-lists', { signal }),
            fetchAPI<Contact[]>('/contacts', { signal }),
          ]);
          setState(prev => ({ ...prev, lists, contacts }));
        }, { skipError: true });
      } catch {
        // Error already handled by makeRequest
      }
    };
    loadData();
  }, [makeRequest]);

  return {
    ...state,
    fetchLists,
    fetchContacts,
    fetchListContacts,
    createList,
    deleteList,
    createContact,
    updateContact,
    deleteContact,
    setSelectedList: (list: ContactListWithContacts | null) => 
      setState(prev => ({ ...prev, selectedList: list })),
  };
};