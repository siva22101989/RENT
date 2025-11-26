'use client';
import {
  doc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  DocumentData,
  Query,
  DocumentReference,
} from 'firebase/firestore';
import { useUser } from './auth/use-user';
import { useState, useEffect } from 'react';

export { useUser, doc, collection, query, where, orderBy, getDocs, onSnapshot };

export * from './provider';

export function useCollection<T>(q: Query<DocumentData> | null) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) {
      setData([]);
      setLoading(false);
      return;
    };
    
    setLoading(true);
    const unsubscribe = onSnapshot(q, snapshot => {
      const docs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as T[];
      setData(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [q]);

  return { data, loading };
}

export function useDoc<T>(ref: DocumentReference<DocumentData> | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ref) {
        setData(null);
        setLoading(false);
        return;
    }

    setLoading(true);
    const unsubscribe = onSnapshot(ref, doc => {
      if (doc.exists()) {
        setData({ ...doc.data(), id: doc.id } as T);
      } else {
        setData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [ref]);

  return { data, loading };
}
