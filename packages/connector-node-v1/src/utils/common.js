export function normalizeResource(resource) {
  if (resource) {
    return {
      capabilities: resource.capabilities,
      createdTime: Date.parse(resource.createdTime),
      id: resource.id,
      modifiedTime: Date.parse(resource.modifiedTime),
      name: resource.name,
      type: resource.type,
      size: resource.size,
      parentId: resource.parentId ? resource.parentId : null,
      ancestors: resource.ancestors ? resource.ancestors : null
    };
  } else {
    return {};
  }
}

export function normalizeInscopixResource(resource) {
  if (resource) {
    return {
      capabilities: { canDelete: true, canRename: true, canCopy: true, canEdit: true, canDownload: true, canListChildren: true, canAddChildren: true, canRemoveChildren: true },
      created: Date.parse(resource.createdTime),
      modifiedTime: new Date(resource.created).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' }),
      name: resource.name,
      type: resource.type,
      size: resource.type === 'DIR' ? '—' : formatBytes(resource.size),
      path: this.path
    };
  } else {
    return {};
  }
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1000;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)));

  return Math.round(bytes / Math.pow(k, i), dm) + ' ' + sizes[i];

}