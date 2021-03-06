define([
    'js/postmonger'
], function(
    Postmonger
) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};
    var lastStepEnabled = false;
    var steps = [ // initialize to the same value as what's set in config.json for consistency
        { "key": "selectCountry", "label": "selectCountry" },
        { "key": "enterFirstName", "label": "enterFirstName" },
        { "key": "enterLastName", "label": "enterLastName" },
        { "key": "enterFavoriteFood", "label": "enterFavoriteFood", "active": false }
    ];
    var currentStep = steps[0].key;

    $(window).ready(onRender);

    connection.on('initEvent', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);

    connection.on('clickedNext', onClickedNext);
    connection.on('clickedBack', onClickedBack);
    connection.on('gotoStep', onGotoStep);

    function initialize (data) {
        var countryCode;
        var firstName;
        var lastName;

        if (data) {
            payload = data;
        }

        if (payload['arguments']) {
            countryCode = payload['arguments'].countryCode;
            firstName = payload['arguments'].firstName;
            lastName = payload['arguments'].lastName;
        }

        $('#select-country-code').val(countryCode);
        $('#select-first-name').val(firstName);
        $('#select-last-name').val(lastName);
    }

    function onGetTokens (tokens) {
        // Response: tokens = { token: <legacy token>, fuel2token: <fuel api token> }
        // console.log(tokens);
    }

    function onGetEndpoints (endpoints) {
        // Response: endpoints = { restHost: <url> } i.e. "rest.s1.qa1.exacttarget.com"
        // console.log(endpoints);
    }

    function onClickedNext () {
        if ((currentStep.key === 'enterLastName' && steps[3].active === false) || currentStep.key === 'enterFavoriteFood') {
            save();
        } else {
            connection.trigger('nextStep');
        }
    }

    function onClickedBack () {
        connection.trigger('prevStep');
    }

    function onGotoStep (step) {
        showStep(step);
        connection.trigger('ready');
    }

    function onRender() {
        connection.trigger('ready'); // JB will respond the first time 'ready' is called with 'initEvent'

        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');

        $('#toggleLastStep').click(function() {
            lastStepEnabled = !lastStepEnabled; // toggle status
            steps[3].active = !steps[3].active; // toggle active

            connection.trigger('updateSteps', steps);
        });
    }

    function showStep(step, stepIndex) {
        if (stepIndex && !step) {
            step = steps[stepIndex-1];
        }

        currentStep = step;

        $('.step').hide();

        switch(currentStep.key) {
            case 'selectCountry':
                $('#step1').show();
                break;
            case 'enterFirstName':
                $('#step2').show();
                $('#step2 input').focus();
                break;
            case 'enterLastName':
                $('#step3').show();
                $('#step3 input').focus();
                break;
            case 'enterFavoriteFood':
                $('#step4').show();
                $('#step4 input').focus();
                break;
        }
    }

    function save() {
        var countryCode = $('#select-country-code').find('option:selected').attr('value');
        var firstName = $('#select-first-name').val();
        var lastName = $('#select-last-name').val();
        var favoriteFood = $('#select-favorite-food').val();

        payload['arguments'] = payload['arguments'] || {};
        payload['arguments'].countryCode = countryCode;
        payload['arguments'].firstName = firstName;
        payload['arguments'].lastName = lastName;
        payload['arguments'].criteria = "<FilterDefinition Source='SubscriberAttribute'><ConditionSet Operator='AND' ConditionSetName='Grouping'><Condition ID='FEB0C2DA-2F06-E511-A833-00237D5401CE' isParam='false' Operator='Equal' operatorEditable='0' valueEditable='1' annotation=''><Value><![CDATA[" + countryCode + "]]></Value></Condition><Condition ID='FDB0C2DA-2F06-E511-A833-00237D5401CE' isParam='false' Operator='Equal' operatorEditable='0' valueEditable='1' annotation=''><Value><![CDATA[" + firstName + "]]></Value></Condition><Condition ID='03B1C2DA-2F06-E511-A833-00237D5401CE' isParam='false' Operator='Equal' operatorEditable='0' valueEditable='1' annotation=''><Value><![CDATA[" + lastName + "]]></Value></Condition></ConditionSet></FilterDefinition>";


        if (favoriteFood && steps[3].active) {
            payload['arguments'].favoriteFood = favoriteFood;
        }

        payload['metaData'] = payload['metaData'] || {};

        payload['configurationArguments'] = payload['configurationArguments'] || {};

        /*payload.schema = {
            "fields":[
                {
                    "name":"countryCode",
                    "dataType":"text",
                    "maxLength":"50",
                    "isNullable":false,
                    "defaultValue":""
                },
                {
                    "name":"firstName",
                    "dataType":"text",
                    "maxLength":"100",
                    "isNullable":false,
                    "defaultValue":""
                },
                {
                    "name":"lastName",
                    "dataType":"text",
                    "maxLength":"100",
                    "isNullable":false,
                    "defaultValue":""
                },
                {
                    "name":"My Integer",
                    "dataType":"number",
                    "maxLength":"",
                    "isNullable":false,
                    "defaultValue":""
                },
                {
                    "name":"My Date",
                    "dataType":"date",
                    "maxLength":"",
                    "isNullable":false,
                    "defaultValue":""
                },
                {
                    "name":"My Bool",
                    "dataType":"boolean",
                    "maxLength":"",
                    "isNullable":false,
                    "defaultValue":"true"
                },
                {
                    "name":"My Email",
                    "dataType":"email",
                    "maxLength":"",
                    "isNullable":false,
                    "defaultValue":""
                },
                {
                    "name":"My Phone",
                    "dataType":"phone",
                    "maxLength":"",
                    "isNullable":false,
                    "defaultValue":""
                },
                {
                    "name":"My Decimal",
                    "dataType":"decimal",
                    "maxLength":"18,0",
                    "isNullable":false,
                    "defaultValue":""
                },
                {
                    "name":"My Locale",
                    "dataType":"locale",
                    "maxLength":"",
                    "isNullable":false,
                    "defaultValue":""
                }
            ],
            "sendableCustomObjectField": "My Email",
            "sendableSubscriberField": "_SubscriberKey"
        };*/
        payload.dataExtensionId = '815BF137-8404-E511-A833-00237D5401CE'; // Pass either schema OR data extension ID
		// payload.eventDefinitionKey = 'Thirucustomkey'; // Pass either schema OR data extension ID
        connection.trigger('updateEvent', payload);
    }
});
