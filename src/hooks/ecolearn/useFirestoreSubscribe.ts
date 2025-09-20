import { useEffect, useState } from 'react';
import { onSnapshot, Query, QuerySnapshot, DocumentData } from 'firebase/firestore';

export function useFirestoreSubscribe<T = DocumentData>(query: Query, map: (snap: QuerySnapshot) => T): { data: T | null; loading: boolean; error: Error | null } {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		setLoading(true);
		const unsub = onSnapshot(
			query,
			(snap) => {
				try {
					setData(map(snap));
					setLoading(false);
				} catch (e: any) {
					setError(e);
					setLoading(false);
				}
			},
			(err) => {
				setError(err as any);
				setLoading(false);
			}
		);
		return () => unsub();
	}, [query]);

	return { data, loading, error };
}


