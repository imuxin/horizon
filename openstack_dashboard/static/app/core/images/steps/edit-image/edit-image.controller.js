/**
 * (c) Copyright 2016 Hewlett-Packard Development Company, L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function() {
  'use strict';

  angular
    .module('horizon.app.core.images')
    .controller('horizon.app.core.images.steps.EditImageController', EditImageController);

  EditImageController.$inject = [
    '$scope',
    'horizon.app.core.images.imageFormats',
    'horizon.app.core.images.validationRules',
    'horizon.app.core.openstack-service-api.settings'
  ];

  /**
   * @ngdoc controller
   * @name horizon.app.core.images.steps.EditImageController
   * @description
   * This controller is use for updating an image.
   */
  function EditImageController(
    $scope,
    imageFormats,
    validationRules,
    settings
  ) {
    var ctrl = this;

    settings.getSettings().then(getConfiguredFormats);
    ctrl.diskFormats = [];
    ctrl.validationRules = validationRules;

    ctrl.imageProtectedOptions = [
      { label: gettext('Yes'), value: true },
      { label: gettext('No'), value: false }
    ];

    ctrl.imageVisibilityOptions = [
      { label: gettext('Public'), value: 'public'},
      { label: gettext('Private'), value: 'private' }
    ];

    ctrl.setFormats = setFormats;
    ctrl.allowPublicizeImage = { rules: [['image', 'publicize_image']] };

    $scope.imagePromise.then(init);

    ///////////////////////////

    function getConfiguredFormats(response) {
      var settingsFormats = response.OPENSTACK_IMAGE_FORMATS;
      var dupe = angular.copy(imageFormats);
      angular.forEach(dupe, function stripUnknown(name, key) {
        if (settingsFormats.indexOf(key) === -1) {
          delete dupe[key];
        }
      });

      ctrl.imageFormats = dupe;
    }

    function init(response) {
      ctrl.image = response.data;
      ctrl.image.kernel = ctrl.image.properties.kernel_id;
      ctrl.image.ramdisk = ctrl.image.properties.ramdisk_id;
      ctrl.image.architecture = ctrl.image.properties.architecture;
      ctrl.image.visibility = ctrl.image.is_public ? 'public' : 'private';
      ctrl.image_format = ctrl.image.disk_format;
      if (ctrl.image.container_format === 'docker') {
        ctrl.image_format = 'docker';
        ctrl.image.disk_format = 'raw';
      }
      setFormats();
    }

    function setFormats() {
      ctrl.image.container_format = 'bare';
      if (['aki', 'ami', 'ari'].indexOf(ctrl.image_format) > -1) {
        ctrl.image.container_format = ctrl.image_format;
      }
      ctrl.image.disk_format = ctrl.image_format;
      if (ctrl.image_format === 'docker') {
        ctrl.image.container_format = 'docker';
        ctrl.image.disk_format = 'raw';
      }
    }

  } // end of controller

})();
