import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import { Settings as SettingsIcon, Save, Image, Edit3 } from 'lucide-react';

const Settings = () => {
    const { user } = useContext(AuthContext);
    const [settings, setSettings] = useState({
        idCardBackground: '',
        registrarName: '',
        registrarSignature: '',
        formDeadline: ''
    });
    const [files, setFiles] = useState({
        idCardBackground: null,
        registrarSignature: null
    });
    const [previews, setPreviews] = useState({
        idCardBackground: '',
        registrarSignature: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get('http://localhost:5000/api/admin/settings', config);
                if (data) {
                    setSettings({
                        ...data,
                        formDeadline: data.formDeadline ? new Date(data.formDeadline).toISOString().split('T')[0] : ''
                    });
                    setPreviews({
                        idCardBackground: data.idCardBackground || '',
                        registrarSignature: data.registrarSignature || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching settings', error);
            }
        };
        fetchSettings();
    }, [user.token]);

    const handleTextChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFiles({ ...files, [e.target.name]: file });
            setPreviews({ ...previews, [e.target.name]: URL.createObjectURL(file) });
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const config = { headers: { 
                Authorization: `Bearer ${user.token}`,
                'Content-Type': 'multipart/form-data'
            } };

            const formData = new FormData();
            formData.append('registrarName', settings.registrarName);
            if (settings.formDeadline) formData.append('formDeadline', settings.formDeadline);
            if (files.idCardBackground) formData.append('idCardBackground', files.idCardBackground);
            if (files.registrarSignature) formData.append('registrarSignature', files.registrarSignature);

            const { data } = await axios.put('http://localhost:5000/api/admin/settings', formData, config);
            setSettings(data);
            alert('Settings saved successfully');
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 max-w-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center"><SettingsIcon className="mr-2" /> System Settings</h2>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
                        <Edit3 className="w-4 h-4 mr-2 text-slate-400" /> Registrar Name
                    </label>
                    <input 
                        type="text" 
                        name="registrarName"
                        value={settings.registrarName}
                        onChange={handleTextChange}
                        className="w-full border p-3 rounded-xl focus:ring-red-500 focus:border-red-500 bg-slate-50"
                        placeholder="e.g. Dr. John Doe"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
                        <Edit3 className="w-4 h-4 mr-2 text-slate-400" /> Form Submission Deadline
                    </label>
                    <input 
                        type="date" 
                        name="formDeadline"
                        value={settings.formDeadline}
                        onChange={handleTextChange}
                        className="w-full border p-3 rounded-xl focus:ring-red-500 focus:border-red-500 bg-slate-50"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
                        <Image className="w-4 h-4 mr-2 text-slate-400" /> ID Card Background
                    </label>
                    <div className="flex flex-col space-y-3">
                        <input 
                            type="file" 
                            name="idCardBackground"
                            onChange={handleFileChange}
                            accept="image/*"
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                        />
                        {previews.idCardBackground && (
                            <div className="relative group">
                                <img src={previews.idCardBackground} alt="Background Preview" className="h-32 w-full object-cover rounded-xl border border-slate-200" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                                    <span className="text-white text-xs font-medium">New Background Preview</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
                        <Image className="w-4 h-4 mr-2 text-slate-400" /> Registrar Signature
                    </label>
                    <div className="flex flex-col space-y-3">
                        <input 
                            type="file" 
                            name="registrarSignature"
                            onChange={handleFileChange}
                            accept="image/*"
                            className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                        />
                        {previews.registrarSignature && (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-center">
                                <img src={previews.registrarSignature} alt="Signature Preview" className="h-16 object-contain" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <button onClick={handleSave} disabled={loading} className="bg-red-600 text-white px-6 py-3 rounded-xl flex items-center hover:bg-red-700 w-full justify-center font-medium shadow-lg shadow-red-500/20 transition-all active:scale-[0.98]">
                        <Save className="w-5 h-5 mr-2" /> {loading ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
