
import React, { useState } from 'react';
import { UserProfile, BioMaterialListing, UserRole } from '../types';

interface ResearchPortalProps {
  profile: UserProfile;
}

const ResearchPortal: React.FC<ResearchPortalProps> = ({ profile }) => {
  const [listings, setListings] = useState<BioMaterialListing[]>([
    { id: '1', farmerName: 'Rajesh Kumar', materialName: 'Rice Husk Ash', quantity: 500, region: 'Punjab', coords: { lat: 30.901, lng: 75.857 }, contactInfo: 'Contact via App', availableDate: '2024-05-20' },
    { id: '2', farmerName: 'Amita Singh', materialName: 'Sugarcane Bagasse', quantity: 1000, region: 'Uttar Pradesh', coords: { lat: 26.846, lng: 80.946 }, contactInfo: 'Contact via App', availableDate: '2024-06-15' },
    { id: '3', farmerName: 'Venkatesh Rao', materialName: 'Dry Neem Leaves', quantity: 200, region: 'Andhra Pradesh', coords: { lat: 17.385, lng: 78.486 }, contactInfo: 'Contact via App', availableDate: '2024-05-10' },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newListing, setNewListing] = useState<Partial<BioMaterialListing>>({
    materialName: '',
    quantity: 0,
    contactInfo: 'Available via AniGuard AI'
  });

  const handleAdd = () => {
    if (!newListing.materialName || !newListing.quantity) return;
    const item: BioMaterialListing = {
      id: Date.now().toString(),
      farmerName: profile.name,
      materialName: newListing.materialName || '',
      quantity: Number(newListing.quantity) || 0,
      region: profile.region,
      coords: profile.coords || { lat: 20.5937, lng: 78.9629 }, // Fallback to center of India
      contactInfo: newListing.contactInfo || '',
      availableDate: new Date().toISOString().split('T')[0]
    };
    setListings([item, ...listings]);
    setIsAdding(false);
    setNewListing({
      materialName: '',
      quantity: 0,
      contactInfo: 'Available via AniGuard AI'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">Research & Collaboration Hub</h2>
          <p className="text-indigo-100 max-w-xl text-sm leading-relaxed opacity-90">
            A secure platform connecting farmers with organic bio-waste and academic researchers for pilot studies and sustainable validation programs.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
             <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl flex items-center">
               <i className="fa-solid fa-vial-circle-check mr-3 text-xl"></i>
               <span className="text-xs font-bold uppercase tracking-wider">Pilot Studies</span>
             </div>
             <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl flex items-center">
               <i className="fa-solid fa-recycle mr-3 text-xl"></i>
               <span className="text-xs font-bold uppercase tracking-wider">Waste Validation</span>
             </div>
          </div>
        </div>
        <i className="fa-solid fa-microscope absolute -right-8 -bottom-8 text-white/5 text-[200px] pointer-events-none"></i>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center">
              <i className="fa-solid fa-info-circle mr-2 text-indigo-600"></i>
              Portal Rules
            </h3>
            <ul className="text-xs space-y-3 text-slate-600">
              <li className="flex items-start">
                <i className="fa-solid fa-check text-green-500 mr-2 mt-0.5"></i>
                Strictly for academic and research validation purposes on AniGuard.
              </li>
              <li className="flex items-start">
                <i className="fa-solid fa-check text-green-500 mr-2 mt-0.5"></i>
                Not a commercial marketplace for selling/buying.
              </li>
              <li className="flex items-start">
                <i className="fa-solid fa-check text-green-500 mr-2 mt-0.5"></i>
                Compensation (if any) is research-grant based.
              </li>
            </ul>
          </div>

          {profile.role === UserRole.FARMER && (
            <button 
              onClick={() => setIsAdding(true)}
              className="w-full bg-indigo-600 text-white p-4 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition flex items-center justify-center space-x-2"
            >
              <i className="fa-solid fa-plus-circle"></i>
              <span>List My Bio-Materials</span>
            </button>
          )}
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2 px-1">
            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Available Materials for Study</h3>
            <span className="text-xs text-slate-400">{listings.length} Listings found</span>
          </div>

          {isAdding && (
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-200 animate-in zoom-in duration-300">
              <h4 className="font-bold text-indigo-900 mb-4">Add Your Listing</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-indigo-600 uppercase mb-1 ml-1">Material Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Neem Seeds"
                      className="w-full p-3 rounded-xl border-none focus:ring-2 focus:ring-indigo-500"
                      value={newListing.materialName}
                      onChange={(e) => setNewListing({...newListing, materialName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-indigo-600 uppercase mb-1 ml-1">Approx Quantity</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 50"
                      className="w-full p-3 rounded-xl border-none focus:ring-2 focus:ring-indigo-500"
                      value={newListing.quantity || ''}
                      onChange={(e) => setNewListing({...newListing, quantity: Number(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={handleAdd} className="flex-1 bg-indigo-600 text-white p-3 rounded-xl font-bold text-sm">Post Listing</button>
                  <button onClick={() => setIsAdding(false)} className="px-4 py-3 text-indigo-600 font-bold text-sm">Cancel</button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {listings.map((listing) => (
              <div key={listing.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 transition group">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition">{listing.materialName}</h4>
                    <p className="text-xs text-slate-500">{listing.quantity}kg • {listing.region}</p>
                  </div>
                  <span className="bg-slate-100 text-slate-500 text-[10px] font-bold uppercase py-1 px-2 rounded">
                    {listing.availableDate}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-3">
                  <div className="flex items-center text-xs text-slate-600">
                    <i className="fa-solid fa-user-circle mr-2 opacity-40"></i>
                    {listing.farmerName}
                  </div>
                  {profile.role === UserRole.RESEARCHER && (
                    <button className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider hover:underline">
                      Express Interest
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchPortal;
