/**
 * SharePoint REST API Interceptor for SPARC Sandbox
 *
 * Patches jQuery.ajax to intercept SharePoint REST calls and return mock
 * responses from an in-memory store. Enables full offline development
 * without a SharePoint server.
 *
 * Load order: jquery.js -> sharepointContext.js -> spInterceptor.js -> app
 *
 * Public API (global):
 *   SPInterceptor.store     -- in-memory data (user, profile, groups, lists)
 *   SPInterceptor.register  -- add custom endpoint handlers
 *   SPInterceptor.logging   -- toggle console output (default: true)
 */
var SPInterceptor = (function ($) {
  'use strict';

  var PREFIX = '[SPInterceptor]';

  // ==================================================================
  // CONFIGURATION -- edit this section to customize the sandbox identity
  // ==================================================================

  var store = {
    user: {
      Id: 1,
      LoginName: _spPageContextInfo.userLoginName,
      Title: 'John Smith',
      Email: 'john.smith@company.com',
    },

    profile: {
      DisplayName: 'John Smith',
      Email: 'john.smith@company.com',
      Title: 'Facilities Manager',
      PictureUrl: '',
      PersonalUrl: '',
      DirectReports: { results: [] },
      ExtendedManagers: { results: [] },
      Peers: { results: [] },
      UserProfileProperties: {
        results: [
          { Key: 'Department', Value: 'Facilities', ValueType: 'Edm.String' },
          { Key: 'Office', Value: 'Building A - Room 101', ValueType: 'Edm.String' },
        ],
      },
    },

    groups: [
      { Id: 1, Title: 'PostHub Members', Description: 'All PostHub users', OwnerTitle: 'Admin' },
      { Id: 2, Title: 'PostHub Facilities', Description: 'Facilities staff', OwnerTitle: 'Admin' },
      { Id: 3, Title: 'PostHub Managers', Description: 'Facilities managers', OwnerTitle: 'Admin' },
    ],

    /** In-memory lists. Pre-populate to seed data for your routes. */
    lists: {
      Packages: {
        items: [
          { Id: 1, Title: 'POSTHUB-20260201-00001', Sender: 'john.smith@company.com', Recipient: 'sarah.johnson@company.com', Status: 'in transit', CurrentLocation: 'LISBON | TOC | 1', DestinationLocation: 'LISBON | TOR | 1', PackageDetails: 'Large envelope - 9x12 inches', InternalNotes: '', Timeline: '[]', AuthorId: 1, Created: '2026-02-01T10:00:00Z', Modified: '2026-02-01T10:00:00Z' },
          { Id: 2, Title: 'POSTHUB-20260201-00012', Sender: 'john.smith@company.com', Recipient: 'michael.chen@company.com', Status: 'delivered', CurrentLocation: 'LISBON | ECHO | 0', DestinationLocation: 'LISBON | ECHO | 0', PackageDetails: 'Box - Pens and notebooks', InternalNotes: '', Timeline: '[]', AuthorId: 1, Created: '2026-02-01T10:00:00Z', Modified: '2026-02-01T10:00:00Z' },
          { Id: 3, Title: 'POSTHUB-20260202-00023', Sender: 'john.smith@company.com', Recipient: 'lisa.anderson@company.com', Status: 'in transit', CurrentLocation: 'LISBON | TOC | 1', DestinationLocation: 'LISBON | AURA | 7', PackageDetails: 'Large envelope - Project documentation', InternalNotes: '', Timeline: '[]', AuthorId: 1, Created: '2026-02-02T10:00:00Z', Modified: '2026-02-02T10:00:00Z' },
          { Id: 4, Title: 'POSTHUB-20260203-00034', Sender: 'john.smith@company.com', Recipient: 'emily.davis@company.com', Status: 'stored', CurrentLocation: 'LISBON | TOC | 1', DestinationLocation: 'LISBON | LUMNIA | 0', PackageDetails: 'Box - Coffee mugs', InternalNotes: '', Timeline: '[]', AuthorId: 1, Created: '2026-02-03T10:00:00Z', Modified: '2026-02-03T10:00:00Z' },
          { Id: 5, Title: 'POSTHUB-20260204-00045', Sender: 'john.smith@company.com', Recipient: 'robert.martinez@company.com', Status: 'delivered', CurrentLocation: 'PORTO | URBO | 0', DestinationLocation: 'PORTO | URBO | 0', PackageDetails: 'Large box - Promotional materials', InternalNotes: '', Timeline: '[]', AuthorId: 1, Created: '2026-02-04T10:00:00Z', Modified: '2026-02-04T10:00:00Z' },
          { Id: 6, Title: 'POSTHUB-20260131-00056', Sender: 'sarah.johnson@company.com', Recipient: 'john.smith@company.com', Status: 'in transit', CurrentLocation: 'LISBON | TOR | 1', DestinationLocation: 'LISBON | TOC | 1', PackageDetails: 'Box - Monitor and accessories', InternalNotes: '', Timeline: '[]', AuthorId: 1, Created: '2026-01-31T10:00:00Z', Modified: '2026-01-31T10:00:00Z' },
          { Id: 7, Title: 'POSTHUB-20260201-00067', Sender: 'james.brown@company.com', Recipient: 'john.smith@company.com', Status: 'created', CurrentLocation: 'LISBON | AURA | 7', DestinationLocation: 'LISBON | TOC | 1', PackageDetails: 'Box - Keyboards and mice', InternalNotes: '', Timeline: '[]', AuthorId: 1, Created: '2026-02-01T10:00:00Z', Modified: '2026-02-01T10:00:00Z' },
          { Id: 8, Title: 'POSTHUB-20260202-00078', Sender: 'michael.chen@company.com', Recipient: 'john.smith@company.com', Status: 'delivered', CurrentLocation: 'LISBON | TOC | 1', DestinationLocation: 'LISBON | TOC | 1', PackageDetails: 'Envelope - Financial documents', InternalNotes: '', Timeline: '[]', AuthorId: 1, Created: '2026-02-02T10:00:00Z', Modified: '2026-02-02T10:00:00Z' },
          { Id: 9, Title: 'POSTHUB-20260203-00089', Sender: 'lisa.anderson@company.com', Recipient: 'john.smith@company.com', Status: 'arrived', CurrentLocation: 'LISBON | TOC | 1', DestinationLocation: 'LISBON | TOC | 1', PackageDetails: 'Large envelope - Technical drawings', InternalNotes: '', Timeline: '[]', AuthorId: 1, Created: '2026-02-03T10:00:00Z', Modified: '2026-02-03T10:00:00Z' },
          { Id: 10, Title: 'POSTHUB-20260130-00090', Sender: 'emily.davis@company.com', Recipient: 'michael.chen@company.com', Status: 'in transit', CurrentLocation: 'LISBON | LUMNIA | 0', DestinationLocation: 'LISBON | ECHO | 0', PackageDetails: 'Box - 18x12x8 inches - Dell Laptop', InternalNotes: '', Timeline: '[]', AuthorId: 1, Created: '2026-01-30T10:00:00Z', Modified: '2026-01-30T10:00:00Z' },
          { Id: 11, Title: 'POSTHUB-20260131-00101', Sender: 'robert.martinez@company.com', Recipient: 'jennifer.taylor@company.com', Status: 'delivered', CurrentLocation: 'LISBON | ECHO | 0', DestinationLocation: 'LISBON | ECHO | 0', PackageDetails: 'Large box - Brochures and flyers', InternalNotes: '', Timeline: '[]', AuthorId: 1, Created: '2026-01-31T10:00:00Z', Modified: '2026-01-31T10:00:00Z' },
          { Id: 12, Title: 'POSTHUB-20260201-00112', Sender: 'james.brown@company.com', Recipient: 'maria.garcia@company.com', Status: 'delivered', CurrentLocation: 'LISBON | TOC | 1', DestinationLocation: 'LISBON | TOC | 1', PackageDetails: 'Envelope - Legal documents', InternalNotes: '', Timeline: '[]', AuthorId: 1, Created: '2026-02-01T10:00:00Z', Modified: '2026-02-01T10:00:00Z' },
          { Id: 13, Title: 'POSTHUB-20260202-00123', Sender: 'david.wilson@company.com', Recipient: 'sarah.johnson@company.com', Status: 'stored', CurrentLocation: 'PORTO | URBO | 0', DestinationLocation: 'LISBON | TOR | 1', PackageDetails: 'Large box - Desk organizers', InternalNotes: '', Timeline: '[]', AuthorId: 1, Created: '2026-02-02T10:00:00Z', Modified: '2026-02-02T10:00:00Z' },
        ],
        fields: [], nextId: 14
      },
      Employees: {
        items: [
          { Id: 1, Title: 'John Smith', SmartCardID: 'SC001', Email: 'john.smith@company.com', AuthorId: 1, Created: '2026-01-01T00:00:00Z', Modified: '2026-01-01T00:00:00Z' },
          { Id: 2, Title: 'Sarah Johnson', SmartCardID: 'SC002', Email: 'sarah.johnson@company.com', AuthorId: 1, Created: '2026-01-01T00:00:00Z', Modified: '2026-01-01T00:00:00Z' },
          { Id: 3, Title: 'Michael Chen', SmartCardID: 'SC003', Email: 'michael.chen@company.com', AuthorId: 1, Created: '2026-01-01T00:00:00Z', Modified: '2026-01-01T00:00:00Z' },
          { Id: 4, Title: 'Emily Davis', SmartCardID: 'SC004', Email: 'emily.davis@company.com', AuthorId: 1, Created: '2026-01-01T00:00:00Z', Modified: '2026-01-01T00:00:00Z' },
          { Id: 5, Title: 'Robert Martinez', SmartCardID: 'SC005', Email: 'robert.martinez@company.com', AuthorId: 1, Created: '2026-01-01T00:00:00Z', Modified: '2026-01-01T00:00:00Z' },
          { Id: 6, Title: 'Lisa Anderson', SmartCardID: 'SC006', Email: 'lisa.anderson@company.com', AuthorId: 1, Created: '2026-01-01T00:00:00Z', Modified: '2026-01-01T00:00:00Z' },
          { Id: 7, Title: 'David Wilson', SmartCardID: 'SC007', Email: 'david.wilson@company.com', AuthorId: 1, Created: '2026-01-01T00:00:00Z', Modified: '2026-01-01T00:00:00Z' },
          { Id: 8, Title: 'Jennifer Taylor', SmartCardID: 'SC008', Email: 'jennifer.taylor@company.com', AuthorId: 1, Created: '2026-01-01T00:00:00Z', Modified: '2026-01-01T00:00:00Z' },
          { Id: 9, Title: 'James Brown', SmartCardID: 'SC009', Email: 'james.brown@company.com', AuthorId: 1, Created: '2026-01-01T00:00:00Z', Modified: '2026-01-01T00:00:00Z' },
          { Id: 10, Title: 'Maria Garcia', SmartCardID: 'SC010', Email: 'maria.garcia@company.com', AuthorId: 1, Created: '2026-01-01T00:00:00Z', Modified: '2026-01-01T00:00:00Z' },
        ],
        fields: [], nextId: 11
      },
      Locations: {
        items: [
          { Id: 1, Title: 'PORTO | URBO | 0', City: 'PORTO', Office: 'URBO', Floor: '0', IsActive: 'true', AuthorId: 1, Created: '2026-01-01T00:00:00Z', Modified: '2026-01-01T00:00:00Z' },
          { Id: 2, Title: 'LISBON | TOC | 1', City: 'LISBON', Office: 'TOC', Floor: '1', IsActive: 'true', AuthorId: 1, Created: '2026-01-01T00:00:00Z', Modified: '2026-01-01T00:00:00Z' },
          { Id: 3, Title: 'LISBON | TOR | 1', City: 'LISBON', Office: 'TOR', Floor: '1', IsActive: 'true', AuthorId: 1, Created: '2026-01-01T00:00:00Z', Modified: '2026-01-01T00:00:00Z' },
          { Id: 4, Title: 'LISBON | ECHO | 0', City: 'LISBON', Office: 'ECHO', Floor: '0', IsActive: 'true', AuthorId: 1, Created: '2026-01-01T00:00:00Z', Modified: '2026-01-01T00:00:00Z' },
          { Id: 5, Title: 'LISBON | AURA | 7', City: 'LISBON', Office: 'AURA', Floor: '7', IsActive: 'true', AuthorId: 1, Created: '2026-01-01T00:00:00Z', Modified: '2026-01-01T00:00:00Z' },
          { Id: 6, Title: 'LISBON | LUMNIA | 0', City: 'LISBON', Office: 'LUMNIA', Floor: '0', IsActive: 'true', AuthorId: 1, Created: '2026-01-01T00:00:00Z', Modified: '2026-01-01T00:00:00Z' },
        ],
        fields: [], nextId: 7
      },
    },
  };

  // ==================================================================
  // INTERNALS
  // ==================================================================

  var logging = true;
  var customHandlers = [];
  var _originalAjax = $.ajax;

  // -- Helpers --

  function _ok(data) {
    return $.Deferred().resolve(data).promise();
  }

  function _method(s) {
    if (s.type === 'GET') return 'GET';
    return (s.headers && s.headers['X-HTTP-Method']) || s.type || 'GET';
  }

  function _listTitle(url) {
    var m = url.match(/getbytitle\('([^']+)'\)/i);
    return m ? m[1] : null;
  }

  function _itemId(url) {
    var m = url.match(/items\((\d+)\)/);
    return m ? parseInt(m[1], 10) : null;
  }

  function _fieldName(url) {
    var m = url.match(/getbyinternalnameortitle\('([^']+)'\)/i);
    return m ? m[1] : null;
  }

  function _ensureList(title) {
    if (!store.lists[title]) store.lists[title] = { items: [], fields: [], nextId: 1 };
    return store.lists[title];
  }

  function _parseBody(settings) {
    return typeof settings.data === 'string' ? JSON.parse(settings.data) : settings.data || {};
  }

  function _log(method, url, detail) {
    if (logging) console.log(PREFIX, method, url, detail ? '-- ' + detail : '');
  }

  var _mockPeople = [
    {
      Key: 'i:0#.w|POSTHUB\\john.smith',
      DisplayText: 'John Smith',
      IsResolved: true,
      EntityType: 'User',
      EntityData: { Email: 'john.smith@company.com', Title: 'Facilities Manager' },
      Description: 'john.smith@company.com',
      ProviderName: 'Active Directory',
      ProviderDisplayName: 'Active Directory',
      MultipleMatches: [],
    },
    {
      Key: 'i:0#.w|POSTHUB\\sarah.johnson',
      DisplayText: 'Sarah Johnson',
      IsResolved: true,
      EntityType: 'User',
      EntityData: { Email: 'sarah.johnson@company.com', Title: 'Office Administrator' },
      Description: 'sarah.johnson@company.com',
      ProviderName: 'Active Directory',
      ProviderDisplayName: 'Active Directory',
      MultipleMatches: [],
    },
    {
      Key: 'i:0#.w|POSTHUB\\michael.chen',
      DisplayText: 'Michael Chen',
      IsResolved: true,
      EntityType: 'User',
      EntityData: { Email: 'michael.chen@company.com', Title: 'Software Engineer' },
      Description: 'michael.chen@company.com',
      ProviderName: 'Active Directory',
      ProviderDisplayName: 'Active Directory',
      MultipleMatches: [],
    },
    {
      Key: 'i:0#.w|POSTHUB\\lisa.anderson',
      DisplayText: 'Lisa Anderson',
      IsResolved: true,
      EntityType: 'User',
      EntityData: { Email: 'lisa.anderson@company.com', Title: 'Project Manager' },
      Description: 'lisa.anderson@company.com',
      ProviderName: 'Active Directory',
      ProviderDisplayName: 'Active Directory',
      MultipleMatches: [],
    },
    {
      Key: 'i:0#.w|POSTHUB\\jane.doe',
      DisplayText: 'Jane Doe',
      IsResolved: true,
      EntityType: 'User',
      EntityData: { Email: 'jane.doe@company.com', Title: 'Facilities Staff' },
      Description: 'jane.doe@company.com',
      ProviderName: 'Active Directory',
      ProviderDisplayName: 'Active Directory',
      MultipleMatches: [],
    },
    {
      Key: 'i:0#.w|POSTHUB\\bob.wilson',
      DisplayText: 'Bob Wilson',
      IsResolved: true,
      EntityType: 'User',
      EntityData: { Email: 'bob.wilson@company.com', Title: 'Department Head' },
      Description: 'bob.wilson@company.com',
      ProviderName: 'Active Directory',
      ProviderDisplayName: 'Active Directory',
      MultipleMatches: [],
    },
  ];

  // -- Custom handler check --

  function _checkCustom(settings) {
    var method = _method(settings);
    var url = settings.url || '';
    for (var i = 0; i < customHandlers.length; i++) {
      var h = customHandlers[i];
      if (h.method !== '*' && h.method !== method) continue;
      var ok =
        typeof h.test === 'string'
          ? url.includes(h.test)
          : h.test instanceof RegExp
            ? h.test.test(url)
            : typeof h.test === 'function'
              ? h.test(url, settings)
              : false;
      if (ok) return h.handler(settings);
    }
    return null;
  }

  // -- Built-in router --

  function _route(settings) {
    var url = settings.url || '';
    var m = _method(settings);

    // Digest refresh
    if (m === 'POST' && url.includes('/_api/contextinfo')) {
      _log('POST', url, 'digest refresh');
      return _ok({
        GetContextWebInformation: {
          FormDigestValue: '0xMOCK_DIGEST_' + Date.now(),
          FormDigestTimeoutSeconds: 1800,
        },
      });
    }

    // People picker search
    if (m === 'POST' && url.includes('clientPeoplePickerSearchUser')) {
      var body = _parseBody(settings);
      var params = body.queryParams;
      var query = (params.QueryString || '').toLowerCase();
      var filtered = _mockPeople.filter(function (p) {
        return p.DisplayText.toLowerCase().indexOf(query) !== -1 ||
               p.EntityData.Email.toLowerCase().indexOf(query) !== -1;
      });
      _log('POST', url, 'people search "' + query + '" -> ' + filtered.length + ' results');
      return _ok({
        d: {
          ClientPeoplePickerSearchUser: JSON.stringify(filtered),
        },
      });
    }

    // Ensure user
    if (m === 'POST' && url.includes('/_api/web/ensureuser')) {
      _log('POST', url, 'ensureUser');
      return _ok({ d: store.user });
    }

    // User groups by ID
    if (m === 'GET' && /getuserbyid\(\d+\)\/groups/.test(url)) {
      _log('GET', url, 'user groups');
      return _ok({ d: { results: store.groups } });
    }

    // User profile (PeopleManager)
    if (m === 'GET' && url.includes('PeopleManager')) {
      _log('GET', url, 'user profile');
      return _ok({ d: store.profile });
    }

    // Site groups
    if (m === 'GET' && url.includes('/_api/web/sitegroups')) {
      _log('GET', url, 'site groups');
      return _ok({ value: store.groups });
    }

    // ---- List-scoped operations ----

    var title = _listTitle(url);

    if (title) {
      var list = _ensureList(title);

      // CAML query (getitems)
      if (m === 'POST' && url.includes('/getitems')) {
        _log('POST', url, title + ' -> ' + list.items.length + ' items');
        return _ok({ value: list.items, ListItemCollectionPosition: null });
      }

      // Create item
      if (m === 'POST' && /\/items\s*$|\/items$/.test(url)) {
        var body = _parseBody(settings);
        var item = $.extend({}, body);
        delete item.__metadata;
        item.Id = list.nextId++;
        item.AuthorId = store.user.Id;
        item.Created = new Date().toISOString();
        item.Modified = new Date().toISOString();
        list.items.push(item);
        _log('POST', url, title + ' createItem -> Id ' + item.Id);
        return _ok(item);
      }

      // Update item (MERGE)
      if (m === 'MERGE' && /\/items\(\d+\)/.test(url)) {
        var uid = _itemId(url);
        var ub = _parseBody(settings);
        delete ub.__metadata;
        var target = list.items.find(function (i) { return i.Id === uid; });
        if (target) $.extend(target, ub, { Modified: new Date().toISOString() });
        _log('MERGE', url, title + ' updateItem ' + uid);
        return _ok(undefined);
      }

      // Delete item
      if (m === 'DELETE' && /\/items\(\d+\)/.test(url)) {
        var did = _itemId(url);
        list.items = list.items.filter(function (i) { return i.Id !== did; });
        _log('DELETE', url, title + ' deleteItem ' + did);
        return _ok(undefined);
      }

      // Create field
      if (m === 'POST' && /\/fields$/.test(url)) {
        var fb = _parseBody(settings);
        var field = {
          Title: fb.Title,
          InternalName: fb.Title,
          TypeAsString: fb.FieldTypeKind === 3 ? 'Note' : 'Text',
          FieldTypeKind: fb.FieldTypeKind || 2,
          Hidden: false,
          ReadOnlyField: false,
          Indexed: !!fb.Indexed,
        };
        list.fields.push(field);
        _log('POST', url, title + ' createField: ' + field.Title);
        return _ok(field);
      }

      // Delete field
      if (m === 'DELETE' && url.includes('getbyinternalnameortitle')) {
        var dfn = _fieldName(url);
        list.fields = list.fields.filter(function (f) { return f.InternalName !== dfn; });
        _log('DELETE', url, title + ' deleteField: ' + dfn);
        return _ok(undefined);
      }

      // Set field indexed (MERGE)
      if (m === 'MERGE' && url.includes('getbyinternalnameortitle')) {
        var sfn = _fieldName(url);
        var sfb = _parseBody(settings);
        var ft = list.fields.find(function (f) { return f.InternalName === sfn; });
        if (ft && sfb.Indexed !== undefined) ft.Indexed = sfb.Indexed;
        _log('MERGE', url, title + ' setFieldIndexed: ' + sfn + ' = ' + sfb.Indexed);
        return _ok(undefined);
      }

      // Get fields
      if (m === 'GET' && url.includes('/fields')) {
        _log('GET', url, title + ' getFields (' + list.fields.length + ')');
        return _ok({ value: list.fields });
      }

      // Delete list (DELETE on list endpoint, no /items or /fields subpath)
      if (m === 'DELETE') {
        delete store.lists[title];
        _log('DELETE', url, 'deleteList: ' + title);
        return _ok(undefined);
      }
    }

    // Create list (POST /_api/web/lists, no getbytitle)
    if (m === 'POST' && /\/_api\/web\/lists$/.test(url)) {
      var clb = _parseBody(settings);
      _ensureList(clb.Title);
      _log('POST', url, 'createList: ' + clb.Title);
      return _ok({ Title: clb.Title, Id: 'mock-' + Date.now() });
    }

    // Get all lists
    if (m === 'GET' && /\/_api\/web\/lists$/.test(url)) {
      var names = Object.keys(store.lists).map(function (t) {
        return { Title: t, Id: 'mock-' + t.toLowerCase().replace(/\s/g, '-') };
      });
      _log('GET', url, 'getLists (' + names.length + ')');
      return _ok({ value: names });
    }

    // Web info (must be last /_api/web handler)
    if (m === 'GET' && /\/_api\/web$/.test(url)) {
      _log('GET', url, 'getWebInfo');
      return _ok({
        Title: _spPageContextInfo.webTitle || 'SPARC Sandbox',
        Url: _spPageContextInfo.webAbsoluteUrl,
      });
    }

    return null;
  }

  // ==================================================================
  // PATCH $.ajax
  // ==================================================================

  $.ajax = function (settings) {
    var result = _checkCustom(settings) || _route(settings);
    if (result) return result;

    console.warn(PREFIX, _method(settings), settings.url, '-- NO HANDLER (falling through)');
    return _originalAjax.call($, settings);
  };

  // ==================================================================
  // PUBLIC API
  // ==================================================================

  console.log(PREFIX, 'Active');

  return {
    store: store,
    register: function (method, test, handler) {
      customHandlers.push({ method: method.toUpperCase(), test: test, handler: handler });
    },
    get logging() {
      return logging;
    },
    set logging(v) {
      logging = !!v;
    },
  };
})(jQuery);
