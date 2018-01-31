// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
'use strict';

// require('./BrowserInfo.es6.js');
// require('./BrowserInfoProperty.es6.js');

foam.CLASS({
  package: 'org.mozilla.mdn',
  name: 'CompatClassGenerator',

  axioms: [foam.pattern.Singleton.create()],

  methods: [
    function generateSpec(pkg, name, browserInfoProps) {
      return {
        class: 'Model',
        package: pkg,
        name: name,

        requires: ['org.mozilla.mdn.BrowserInfo'],
        imports: ['warn'],

        axioms: [
          foam.u2.CSS.create({
            code: `
/* TODO(markdittmer): This should come from "^"/"myClass()", but code generation
  with implements: ['foam.u2.Element'] is broken in NodeJS. */
.org-mozilla-mdn-generated-CompatRow-id {
  position: absolute;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  padding: 0 5px;
}
`
          }),
        ],

        tableColumns: ['id'].concat(browserInfoProps.map(p => p.name)),

        properties: [
          {
            class: 'String',
            name: 'id',
            label: 'API',
            required: true,
            tableCellFormatter: function(value, obj, axiom) {
              const cls = 'org-mozilla-mdn-generated-CompatRow-id';
              return `<div class="${cls}"><span>${value === undefined ? '&nbsp;' : value}</span></div>`;
            },
          },
        ].concat(browserInfoProps),

        methods: [
          {
            name: 'fromMdnData',
            code: function fromMdnData(data) {
              const compatMap = data.__compat.support;
              let compatKeys = Object.keys(compatMap);
              for (const key of compatKeys) {
                if (!compatMap[key].version_added &&
                    !compatMap[key].version_removed) {
                  continue;
                }
                let versionAdded = compatMap[key].version_added ?
                      compatMap[key].version_added === true ?
                      0 :
                      parseFloat(compatMap[key].version_added) :
                      Infinity;
                let versionRemoved = compatMap[key].version_removed ?
                      parseFloat(compatMap[key].version_removed) :
                      Infinity;

                if (Number.isNaN(versionAdded)) {
                  this.warn(`Version added for ${this.id} ${key}: ${compatMap[key].version_added} NaN`);
                  versionAdded = Infinity;
                }
                if (Number.isNaN(versionRemoved)) {
                  this.warn(`Version removed for ${this.id} ${key}: ${compatMap[key].version_removed} NaN`);
                  versionRemoved = Infinity;
                }

                const prop = this.cls_.getAxiomByName(
                    this.propNameFromMdnKey(key));
                prop.set(this, this.BrowserInfo.create({
                  versionAdded,
                  versionRemoved,
                }));
              }
              return this;
            },
          },
          {
            name: 'browserNameFromMdnKey',
            code: this.browserNameFromMdnKey,
          },
          {
            name: 'propNameFromMdnKey',
            code: this.propNameFromMdnKey,
          },
        ],
      };
    },
    function generateClass(spec) {
      if (foam.core.Model.isInstance(spec)) {
        spec.validate();
        const cls = spec.buildClass();
        cls.validate();
        foam.register(cls);
        foam.package.registerClass(cls);
        return cls;
      } else {
        foam.CLASS(spec);
        return foam.lookup(`${spec.package}.${spec.name}`);
      }
    },
    function browserNameFromMdnKey(key) {
      const parts = key.split('_');
      return parts.map(p => p.charAt(0).toUpperCase() + p.substr(1))
          .join(' ');
    },
    function propNameFromMdnKey(key) {
      let parts = key.split('_');
      const first = parts.shift();
      return first + parts.map(p => p.charAt(0).toUpperCase() +
                               p.substr(1))
          .join('') + 'BrowserInfo';
    },
  ],
});