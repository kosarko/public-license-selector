Y = true
N = false

###
# Module: data/compatibility.coffee
# Summary: Compatibility matrix used during the software flow to detect incompatible license mixes.
###
LicenseCompatibility =
  columns:              ['cc-public-domain', 'mit', 'bsd-2c', 'bsd-3c', 'apache-2', 'lgpl-2.1', 'lgpl-2.1+', 'lgpl-3', 'mpl-2', 'epl-1', 'cddl-1.1', 'gpl-2', 'gpl-2+', 'gpl-3', 'agpl-1', 'agpl-3', 'epl-2']
  table:
    'cc-public-domain': [ Y,                  Y,     Y,        Y,        Y,          Y,          Y,           Y,        Y,       Y,       Y,           Y,       Y,        Y,       Y,        Y,       Y      ]
    'mit':              [ N,                  Y,     Y,        Y,        Y,          Y,          Y,           Y,        Y,       Y,       Y,           Y,       Y,        Y,       Y,        Y,       Y      ]
    'bsd-2c':           [ N,                  N,     Y,        Y,        Y,          Y,          Y,           Y,        Y,       Y,       Y,           Y,       Y,        Y,       Y,        Y,       Y      ]
    'bsd-3c':           [ N,                  N,     N,        Y,        Y,          Y,          Y,           Y,        Y,       Y,       Y,           Y,       Y,        Y,       Y,        Y,       Y      ]
    'apache-2':         [ N,                  N,     N,        N,        Y,          N,          N,           Y,        Y,       Y,       N,           N,       Y,        Y,       N,        Y,       Y      ]
    'lgpl-2.1':         [ N,                  N,     N,        N,        N,          Y,          N,           N,        Y,       N,       N,           Y,       N,        N,       Y,        N,       N      ]
    'lgpl-2.1+':        [ N,                  N,     N,        N,        N,          N,          Y,           Y,        Y,       N,       N,           Y,       Y,        Y,       Y,        Y,       N      ]
    'lgpl-3':           [ N,                  N,     N,        N,        N,          N,          N,           Y,        Y,       N,       N,           N,       Y,        Y,       N,        Y,       N      ]
    'mpl-2':            [ N,                  N,     N,        N,        N,          Y,          Y,           Y,        Y,       N,       N,           Y,       Y,        Y,       Y,        Y,       N      ]
    'epl-1':            [ N,                  N,     N,        N,        N,          N,          N,           N,        Y,       Y,       Y,           N,       N,        Y,       N,        Y,       Y      ]
    'cddl-1.1':         [ N,                  N,     N,        N,        N,          N,          N,           N,        N,       N,       Y,           N,       N,        N,       N,        N,       N      ]
    'gpl-2':            [ N,                  N,     N,        N,        N,          N,          N,           N,        N,       N,       N,           Y,       N,        N,       Y,        N,       N      ]
    'gpl-2+':           [ N,                  N,     N,        N,        N,          N,          N,           N,        N,       N,       N,           Y,       Y,        Y,       Y,        Y,       Y      ]
    'gpl-3':            [ N,                  N,     N,        N,        N,          N,          N,           N,        N,       N,       N,           N,       N,        Y,       N,        Y,       Y      ]
    'agpl-1':           [ N,                  N,     N,        N,        N,          N,          N,           N,        N,       N,       N,           N,       N,        N,       Y,        N,       N      ]
    'agpl-3':           [ N,                  N,     N,        N,        N,          N,          N,           N,        N,       N,       N,           N,       N,        N,       N,        Y,       Y      ]
    'epl-2':            [ N,                  N,     N,        N,        N,          N,          N,           N,        Y,       Y,       Y,           N,       Y,        Y,       N,        Y,       Y      ]

module.exports = LicenseCompatibility
