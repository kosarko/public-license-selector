_ = require 'lodash'
LicenseCompatibility = require './compatibility'

###
# Module: data/questions.coffee
# Summary: Decision tree functions invoked by `LicenseSelector.goto`.
###
QuestionDefinitions =
  KindOfContent: ->
    @question 'What do you want to deposit?'
    @answer 'Software', ->
      @exclude 'data'
      @goto 'YourSoftware'

    @answer 'Data', ->
      @exclude 'software'
      @goto 'DataCopyrightable'

  # Data
  DataCopyrightable: ->
    @question 'Is your data within the scope of copyright and/or special right of the database maker?'
    @yes -> @goto 'AllOriginal'
    @no -> @license 'cc-public-domain'

  AllOriginal: ->
    @question 'Is everything in the dataset your original work?'
    @yes -> @goto 'AllowDerivativeWorks'
    @no -> @goto 'EnsureLicensing'

  AllowDerivativeWorks: ->
    @question 'Do you allow others to make derivative works?'
    @yes ->
      @exclude 'nd'
      @goto 'ShareAlike'
    @no ->
      @include 'nd'
      if @only 'nc'
        @license()
      else
        @goto 'CommercialUse'

  ShareAlike: ->
    @question 'Do you require others to share derivative works based on your data under the same license?'
    @yes ->
      @include 'sa'
      if @only 'nc'
        @license()
      else
        @goto 'CommercialUse'
    @no ->
      @exclude 'sa'
      if @only 'nc'
        @license()
      else
        @goto 'CommercialUse'

  CommercialUse: ->
    @question 'Do you allow others to use your data commercially?'
    @yes ->
      @exclude 'nc'
      if @only 'by'
        @license()
      else
        @goto 'DecideAttribute'
    @no ->
      @include 'nc'
      @include 'by'
      @license()

  DecideAttribute: ->
    @question 'Do you want others to attribute your data to you?'
    @yes ->
      @include 'by'
      @license()
    @no ->
      @include 'public-domain'
      @license()

  EnsureLicensing: ->
    @question 'Is the third-party content of the dataset licensed under a public license / in the public domain? '
    @yes -> @goto 'Changed3dPartyContent'
    @no -> @cantlicense 'You need additional permission before you can deposit the data!'

  LicenseInteropData: ->
    @question 'Under which license was the third-party content that you changed licensed?'
    @option ['cc-public-domain', 'cc-zero', 'pddl'], -> @goto 'AllowDerivativeWorks'
    @option ['cc-by', 'odc-by'], ->
      @exclude 'public-domain'
      @goto 'AllowDerivativeWorks'
    @option ['cc-by-nc'], ->
      @include 'nc'
      @goto 'AllowDerivativeWorks'
    @option ['cc-by-nc-sa'], ->
      @license 'cc-by-nc-sa'
    @option ['odbl'], -> @license 'odbl', 'cc-by-sa'
    @option ['cc-by-sa'], -> @license 'cc-by-sa'
    @option ['cc-by-nd', 'cc-by-nc-nd'], ->
      @cantlicense "License doesn't allow derivative works. You need additional permission before you can deposit the data!"
    nextAction = (state) ->
      option = _(state.options).filter('selected').last()
      return unless option?
      option.action()
    disabledCheck = (state) ->
      !_.any state.options, (option) -> option.selected
    @answer 'Next', nextAction, disabledCheck

  Changed3dPartyContent: ->
    @question 'Have you made any changes to the third-party content of the dataset?'
    @yes -> @goto 'LicenseInteropData'
    @no -> @goto 'AllowDerivativeWorks'

  
  # Software
  YourSoftware: ->
    @question 'Is your software based on existing code or is it all your original work?'
    @answer 'Based on existing software', -> @goto 'LicenseInteropSoftware'
    @answer 'Original work', -> @goto 'Copyleft'

  LicenseInteropSoftware: ->
    @question 'Select licenses of the code in your software:'
    for license in LicenseCompatibility.columns
      @option [license]

    nextAction = (state) ->
      licenses = _(state.options).filter('selected').pluck('licenses').flatten().valueOf()
      return if licenses.length is 0
      for license1 in licenses
        index1 = _.indexOf(LicenseCompatibility.columns, license1.key)
        for license2 in licenses
          index2 = _.indexOf(LicenseCompatibility.columns, license2.key)
          unless LicenseCompatibility.table[license2.key][index1] or LicenseCompatibility.table[license1.key][index2]
            @cantlicense "The licenses <strong>#{license1.name}</strong> and <strong>#{license2.name}</strong> in your software are incompatible. Contact the copyright owner and try to talk them into re-licensing."
            return
      list = null
      for license in licenses
        unless list?
          list = LicenseCompatibility.table[license.key]
          continue
        l = LicenseCompatibility.table[license.key]
        list = _.map list, (val, index) -> l[index] && val
      licenses = []
      for index, value of list
        continue unless value
        licenseKey = LicenseCompatibility.columns[index]
        if licenseKey && @licenses[licenseKey]?
          license = @licenses[licenseKey]
          unless license.available
            license = _.assign({}, license, {compatibilityFallback: true, labels: (license.labels or []).concat('not-recommended')})
          licenses.push license

      @licensesList.update(licenses)

      if @has('copyleft') and @has('permissive')
        @goto 'Copyleft' # we are left with many options after compat filtering, trim them down by further questions
      else if @only('copyleft') and @only('strong')
        @license()
      else 
        @goto 'ModifyingOrUsing'
      return
    @answer 'Next', nextAction, (state) -> !_.any state.options, (option) -> option.selected

  ModifyingOrUsing: ->
    @question 'Are you modifying the existing software or is the existing software only being used as a part of your larger work?'
    @answer 'Modifying', ->
      @license()
    @answer 'Using', ->
      @licensesList.update @licenses
      @exclude 'data'
      @goto 'Copyleft'

  Copyleft: ->
    @question 'Do you require others who use your code in their software to release it under a compatible open-source license?'
    @yes ->
      @include 'copyleft'
      if @has('weak') and @has('strong')
        @goto 'StrongCopyleft'
      else
        @license()
    @no ->
      @exclude 'copyleft'
      # XXX This would filter out PD?
      #@include 'permissive'
      @license()

  StrongCopyleft: ->
    @question 'Do you require others to use a compatible open-source license for the software as a whole or only for the parts that modified your code?'
    @answer 'For the software as a whole', ->
      @include 'strong'
      @license()
    @answer 'Only for modified parts', ->
      @include 'weak'
      @license()

module.exports = QuestionDefinitions
