// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

foam.CLASS({
  package: 'org.mozilla.mdn.mlang',
  name: 'Expressions',
  refines: 'foam.mlang.Expressions',

  requires: [
    'org.mozilla.mdn.mlang.Seq',
  ],

  methods: [
    function SEQ() {
      return this.Seq.create({args: Array.from(arguments)});
    },
  ],
});
