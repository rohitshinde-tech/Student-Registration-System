import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { Layers, Plus, Trash2 } from 'lucide-react';

const Departments = () => {
    const { user } = useContext(AuthContext);
    const [departments, setDepartments] = useState([]);
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [hodName, setHodName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/admin/departments', config);
            setDepartments(data);
        } catch (error) {
            console.error('Error fetching departments', error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/admin/departments', { name, code, hodName, username, password }, config);
            setName('');
            setCode('');
            setHodName('');
            setUsername('');
            setPassword('');
            fetchDepartments();
        } catch (error) {
            alert('Failed to create department');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold mb-6 flex items-center"><Layers className="mr-2" /> Departments Management</h2>
            
            <form onSubmit={handleCreate} className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                    <input 
                        type="text" 
                        placeholder="Department Name" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        required 
                        className="border p-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                    <input 
                        type="text" 
                        placeholder="Department Code" 
                        value={code} 
                        onChange={e => setCode(e.target.value)} 
                        required 
                        className="border p-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                    <input 
                        type="text" 
                        placeholder="HOD Name" 
                        value={hodName} 
                        onChange={e => setHodName(e.target.value)} 
                        className="border p-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                    <input 
                        type="text" 
                        placeholder="Admin Username" 
                        value={username} 
                        onChange={e => setUsername(e.target.value)} 
                        className="border p-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                    <input 
                        type="password" 
                        placeholder="Admin Password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        className="border p-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                </div>
                <div className="flex justify-end">
                    <button type="submit" disabled={loading} className="bg-red-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-red-700 transition-colors shadow-sm hover:shadow-md">
                        <Plus className="w-5 h-5 mr-1" /> Add Department
                    </button>
                </div>
            </form>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wider">
                            <th className="p-4 rounded-tl-lg font-semibold">Name</th>
                            <th className="p-4 font-semibold">Code</th>
                            <th className="p-4 font-semibold">HOD Name</th>
                            <th className="p-4 font-semibold">Username</th>
                            <th className="p-4 rounded-tr-lg font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {departments.map(dept => (
                            <tr key={dept._id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-medium text-slate-800">{dept.name}</td>
                                <td className="p-4 font-mono text-slate-600">{dept.code}</td>
                                <td className="p-4 text-slate-600">{dept.hodName || '-'}</td>
                                <td className="p-4 text-slate-600">{dept.username || '-'}</td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={async () => {
                                            const newHod = prompt('Enter new HOD Name:', dept.hodName || '');
                                            const newPass = prompt('Enter new Password (leave blank to keep current):');
                                            if (newHod !== null) {
                                                try {
                                                    const payload = { hodName: newHod };
                                                    if (newPass) payload.password = newPass;
                                                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                                                    await axios.put(`http://localhost:5000/api/admin/departments/${dept._id}`, payload, config);
                                                    fetchDepartments();
                                                } catch(err) {
                                                    alert('Error updating department');
                                                }
                                            }
                                        }}
                                        className="text-blue-500 hover:text-blue-700 transition-colors mr-3 text-sm font-medium"
                                    >
                                        Edit
                                    </button>
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

export default Departments;
