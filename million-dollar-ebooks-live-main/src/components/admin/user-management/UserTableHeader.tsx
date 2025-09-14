
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function UserTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-48">User</TableHead>
        <TableHead className="w-24">Role</TableHead>
        <TableHead className="w-40">Status</TableHead>
        <TableHead className="w-32">Bio</TableHead>
        <TableHead className="w-24">Verified</TableHead>
        <TableHead className="w-32">Change Role</TableHead>
        <TableHead className="w-24">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
