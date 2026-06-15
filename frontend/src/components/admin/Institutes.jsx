import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { Building, Plus, Trash2 } from 'lucide-react';

const Institutes = () => {
    const { user } = useContext(AuthContext);
    const [institutes, setInstitutes] = useState([]);
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchInstitutes();
    }, []);

    const fetchInstitutes = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/admin/institutes', config);
            setInstitutes(data);
        } catch (error) {
            console.error('Error fetching institutes', error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/admin/institutes', { name, code }, config);
            setName('');
            setCode('');
            fetchInstitutes();
        } catch (error) {
            alert('Failed to create institute');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-6 flex items-center"><Building className="mr-2" /> Institutes Management</h2>
            
            <form onSubmit={handleCreate} className="flex gap-4 mb-8">
                <input 
                    type="text" 
                    placeholder="Institute Name" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                    className="flex-1 border p-2 rounded-lg"
                />
                <input 
                    type="text" 
                    placeholder="Institute Code" 
                    value={code} 
                    onChange={e => setCode(e.target.value)} 
                    required 
                    className="w-32 border p-2 rounded-lg"
                />
                <button type="submit" disabled={loading} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-700">
                    <Plus className="w-5 h-5 mr-1" /> Add
                </button>
            </form>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
                            <th className="p-4 rounded-tl-lg font-semibold">Name</th>
                            <th className="p-4 font-semibold">Code</th>
                            <th className="p-4 rounded-tr-lg font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {institutes.map(inst => (
                            <tr key={inst._id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-medium text-slate-800">{inst.name}</td>
                                <td className="p-4 font-mono text-slate-600">{inst.code}</td>
                                <td className="p-4 text-right">
                                    <button className="text-slate-400 hover:text-rose-600 transition-colors">
                                        <Trash2 className="w-5 h-5 inline" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Institutes;
