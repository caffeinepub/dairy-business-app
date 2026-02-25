import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { Cattle } from '../lib/localTypes';
import { timeToDate } from '../hooks/useQueries';

interface CattleFormProps {
    mode: 'add' | 'edit';
    initialValues?: Cattle;
    onSubmit: (data: { name: string; breed: string; birthDate: Date; status: string }) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export default function CattleForm({ mode, initialValues, onSubmit, onCancel, isLoading }: CattleFormProps) {
    const [name, setName] = useState(initialValues?.name ?? '');
    const [breed, setBreed] = useState(initialValues?.breed ?? '');
    const [birthDate, setBirthDate] = useState(
        initialValues ? timeToDate(initialValues.birthDate).toISOString().split('T')[0] : ''
    );
    const [status, setStatus] = useState(initialValues?.status ?? 'active');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !breed.trim() || !birthDate) return;
        onSubmit({
            name: name.trim(),
            breed: breed.trim(),
            birthDate: new Date(birthDate),
            status,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
                <Label htmlFor="cattle-name">Name</Label>
                <Input
                    id="cattle-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Bessie"
                    required
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="cattle-breed">Breed</Label>
                <Input
                    id="cattle-breed"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="e.g. Holstein"
                    required
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="cattle-birthdate">Birth Date</Label>
                <Input
                    id="cattle-birthdate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                />
            </div>
            {mode === 'edit' && (
                <div className="space-y-1.5">
                    <Label htmlFor="cattle-status">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger id="cattle-status">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="sold">Sold</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}
            <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {mode === 'add' ? 'Add Cattle' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}
