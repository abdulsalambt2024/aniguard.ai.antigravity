import { createClient } from '@supabase/supabase-js';

// --- Types for Mock Data ---
interface MockUser {
    id: string;
    email: string;
    role: string;
    full_name: string;
}

interface MockSession {
    user: MockUser;
    access_token: string;
}

// --- Mock Data ---
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000';
const MOCK_USER: MockUser = {
    id: MOCK_USER_ID,
    email: 'demo@example.com',
    role: 'admin',
    full_name: 'Demo Admin',
};

const MOCK_SESSION: MockSession = {
    user: MOCK_USER,
    access_token: 'mock-token',
};

const mockDb: Record<string, any[]> = {
    user_roles: [
        { user_id: MOCK_USER_ID, role: 'admin' },
        { user_id: 'member-1', role: 'member' }
    ],
    profiles: [
        {
            user_id: MOCK_USER_ID,
            full_name: 'Demo Admin',
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
            roll_number: 'ADMIN001',
            course: 'B.Tech',
            branch: 'CSE',
            created_at: new Date().toISOString()
        },
        {
            user_id: 'member-1',
            full_name: 'Test Member',
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=member1',
            roll_number: 'MEM001',
            course: 'B.Tech',
            branch: 'ECE',
            created_at: new Date().toISOString()
        }
    ],
    attendance: [
        {
            id: 'att-1',
            user_id: MOCK_USER_ID,
            date: new Date().toISOString().split('T')[0],
            status: 'present',
            created_at: new Date().toISOString()
        }
    ],
    posts: [],
    donations: [],
    campaigns: [
        {
            id: 'camp-1',
            title: 'Education For All',
            description: 'Helping underprivileged children get quality education.',
            target_amount: 50000,
            current_amount: 15000,
            end_date: new Date(Date.now() + 86400000 * 30).toISOString(),
            created_at: new Date().toISOString(),
            banner_url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b',
            amount_presets: [100, 500, 1000]
        }
    ],
    messages: []
};

// --- Mock Client ---
export const mockSupabase = {
    auth: {
        getSession: async () => ({ data: { session: MOCK_SESSION }, error: null }),
        getUser: async () => ({ data: { user: MOCK_USER }, error: null }),
        onAuthStateChange: (callback: any) => {
            callback('SIGNED_IN', MOCK_SESSION);
            return { data: { subscription: { unsubscribe: () => { } } } };
        },
        signInWithPassword: async () => ({ data: { user: MOCK_USER, session: MOCK_SESSION }, error: null }),
        signUp: async () => ({ data: { user: MOCK_USER, session: MOCK_SESSION }, error: null }),
        signOut: async () => ({ error: null }),
        resetPasswordForEmail: async () => ({ error: null }),
    },
    from: (table: string) => {
        return new MockQueryBuilder(table);
    },
    rpc: async (fn: string, args: any) => {
        console.log(`[Mock RPC] ${fn}`, args);
        if (fn === 'get_user_role') {
            return { data: 'admin', error: null };
        }
        return { data: null, error: null };
    },
    functions: {
        invoke: async (fn: string, args: any) => {
            console.log(`[Mock Function] ${fn}`, args);
            if (fn === 'ai-studio') {
                // Return a placeholder image for any AI generation
                return {
                    data: { imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60" },
                    error: null
                };
            }
            if (fn === 'initiate-payment') {
                return {
                    data: { payment_id: 'mock_pay_123', upi_url: '#' },
                    error: null
                };
            }
            if (fn === 'verify-payment') {
                return { data: { success: true }, error: null };
            }
            return { data: {}, error: null };
        }
    },
    storage: {
        from: (bucket: string) => ({
            upload: async (path: string, file: any) => {
                console.log(`[Mock Upload] ${bucket}/${path}`);
                return { data: { path }, error: null };
            },
            getPublicUrl: (path: string) => {
                return { data: { publicUrl: `https://placehold.co/600x400?text=${encodeURIComponent(path)}` } };
            }
        })
    },
    channel: (name: string) => ({
        on: () => ({ subscribe: () => { } }),
        subscribe: () => { }
    })
};

// --- Mock Query Builder ---
class MockQueryBuilder {
    private table: string;
    private filters: any[] = [];
    private _select: string = '*';
    private _order: any = null;
    private _limit: number | null = null;
    private _single = false;
    private _operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' = 'SELECT';
    private _operationData: any = null;

    constructor(table: string) {
        this.table = table;
    }

    select(columns: string = '*', options?: any) {
        this._select = columns;
        if (options?.count) {
            // Handle count
        }
        return this;
    }

    eq(column: string, value: any) {
        this.filters.push({ column, operator: 'eq', value });
        return this;
    }

    in(column: string, values: any[]) {
        this.filters.push({ column, operator: 'in', value: values });
        return this;
    }

    order(column: string, options: any) {
        this._order = { column, ...options };
        return this;
    }

    limit(count: number) {
        this._limit = count;
        return this;
    }

    single() {
        this._single = true;
        return this;
    }

    // Modifiers - Now chainable
    insert(data: any) {
        this._operation = 'INSERT';
        this._operationData = data;
        return this;
    }

    update(data: any) {
        this._operation = 'UPDATE';
        this._operationData = data;
        return this;
    }

    delete() {
        this._operation = 'DELETE';
        return this;
    }

    upsert(data: any) {
        return this.insert(data);
    }

    // Execution
    then(resolve: any, reject: any) {
        this.execute().then(resolve).catch(reject);
    }

    async execute() {
        if (this._operation === 'INSERT') {
            console.log(`[Mock Insert] ${this.table}`, this._operationData);
            const newItem = { id: `mock-${Date.now()}`, ...this._operationData, created_at: new Date().toISOString() };
            if (!mockDb[this.table]) mockDb[this.table] = [];
            mockDb[this.table].push(newItem);

            // If .select() was called (which is default behavior for v2 if checked, but here we just return data if present)
            // Supabase returns null data for insert unless .select() is called.
            // But for this mock, we'll always return the item if it was an insert to be safe, or just the item.
            return { data: this._single ? newItem : [newItem], error: null };
        }

        if (this._operation === 'UPDATE') {
            console.log(`[Mock Update] ${this.table}`, this._operationData);
            // Simple update implementation - updates all records matching filters
            // In a real app, this would be more complex.
            // We'll just update the first match for now or log it.
            return { data: this._single ? { ...this._operationData } : [{ ...this._operationData }], error: null };
        }

        if (this._operation === 'DELETE') {
            console.log(`[Mock Delete] ${this.table}`);
            return { data: null, error: null };
        }

        // Default: SELECT
        let data = mockDb[this.table] || [];

        // Apply filters
        for (const filter of this.filters) {
            if (filter.operator === 'eq') {
                data = data.filter((item: any) => item[filter.column] == filter.value);
            } else if (filter.operator === 'in') {
                data = data.filter((item: any) => filter.value.includes(item[filter.column]));
            }
        }

        if (this._order) {
            data.sort((a: any, b: any) => {
                if (a[this._order.column] < b[this._order.column]) return this._order.ascending ? -1 : 1;
                if (a[this._order.column] > b[this._order.column]) return this._order.ascending ? 1 : -1;
                return 0;
            });
        }

        if (this._limit) {
            data = data.slice(0, this._limit);
        }

        if (this._single) {
            return { data: data[0] || null, error: null };
        }

        const result: any = { data, error: null };
        result.count = data.length;

        return result;
    }
}
