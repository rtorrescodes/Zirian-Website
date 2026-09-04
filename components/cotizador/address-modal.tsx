
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";

const libraries: any = ["places"];

export function AddressModal({ isOpen, onClose, onConfirm }: { isOpen: boolean, onClose: () => void, onConfirm: (address: any) => void }) {
  const [addressData, setAddressData] = useState({
    nombre_contacto: "Polo Esponda",
    calle: "",
    num_ext: "",
    num_int: "",
    colonia: "",
    codigo_postal: "",
    ciudad: "",
    estado: "",
    telefono: "449 769 4130"
  });

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries
  });
  
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (!place.address_components) return;
      
      let calle = "";
      let num_ext = "";
      let colonia = "";
      let ciudad = "";
      let estado = "";
      let cp = "";
      
      place.address_components.forEach(comp => {
        const type = comp.types[0];
        if (type === "route") calle = comp.long_name;
        if (type === "street_number") num_ext = comp.long_name;
        if (type === "sublocality_level_1" || type === "neighborhood") colonia = comp.long_name;
        if (type === "locality") ciudad = comp.long_name;
        if (type === "administrative_area_level_1") estado = comp.long_name;
        if (type === "postal_code") cp = comp.long_name;
      });
      
      setAddressData(prev => ({
        ...prev,
        calle: calle || prev.calle,
        num_ext: num_ext || prev.num_ext,
        colonia: colonia || prev.colonia,
        ciudad: ciudad || prev.ciudad,
        estado: estado || prev.estado,
        codigo_postal: cp || prev.codigo_postal
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-slate-900 text-white border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-cyan">Dirección de Envío</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-slate-400">Si deseas enviar el pedido a Syscom, ingresa o verifica la dirección de entrega del cliente.</p>
          
          {isLoaded && (
            <div className="space-y-2">
              <Label className="text-slate-300">Buscar con Google Maps</Label>
              <Autocomplete onLoad={setAutocomplete} onPlaceChanged={onPlaceChanged}>
                <Input placeholder="Empieza a escribir la dirección..." className="bg-slate-800 border-slate-700 focus-visible:ring-brand-cyan" />
              </Autocomplete>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Nombre Contacto</Label>
              <Input name="nombre_contacto" value={addressData.nombre_contacto} onChange={handleChange} className="bg-slate-800 border-slate-700" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Teléfono</Label>
              <Input name="telefono" value={addressData.telefono} onChange={handleChange} className="bg-slate-800 border-slate-700" />
            </div>
          </div>
          
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-3 space-y-2">
              <Label className="text-slate-300">Calle</Label>
              <Input name="calle" value={addressData.calle} onChange={handleChange} className="bg-slate-800 border-slate-700" />
            </div>
            <div className="col-span-1 space-y-2">
              <Label className="text-slate-300">Núm Ext</Label>
              <Input name="num_ext" value={addressData.num_ext} onChange={handleChange} className="bg-slate-800 border-slate-700" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-slate-300">Colonia</Label>
              <Input name="colonia" value={addressData.colonia} onChange={handleChange} className="bg-slate-800 border-slate-700" />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">C.P.</Label>
              <Input name="codigo_postal" value={addressData.codigo_postal} onChange={handleChange} className="bg-slate-800 border-slate-700" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Ciudad</Label>
              <Input name="ciudad" value={addressData.ciudad} onChange={handleChange} className="bg-slate-800 border-slate-700" />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Estado</Label>
              <Input name="estado" value={addressData.estado} onChange={handleChange} className="bg-slate-800 border-slate-700" />
            </div>
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-slate-700 hover:bg-slate-800 text-white">Cancelar</Button>
          <Button onClick={() => onConfirm(addressData)} className="bg-brand-blue hover:bg-brand-cyan text-slate-900 font-bold">Aprobar y Continuar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

