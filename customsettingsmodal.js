/*!
 **|  CyTube Custom Settings Modal
 **|  Copyright Xaekai 2014 - 2016
 **|  Version 2016.10.04.0100
 **|
 **@preserve
 */
"use strict";

function createModal(data) {
    var title = data.title || "Empty Modal";
    var title_m = !!data.titleIsMarkup;
    var wrap = $("<div/>").addClass("modal fade").attr("tabindex", "-1");
    var dialog = $("<div/>").addClass("modal-dialog").appendTo(wrap);
    var content = $("<div/>").addClass("modal-content").appendTo(dialog);
    var head = $("<div/>").addClass("modal-header").appendTo(content);
    var body = $("<div/>").addClass("modal-body").appendTo(content);
    var foot = $("<div/>").addClass("modal-footer");
    $("<button/>").addClass("close").attr("data-dismiss", "modal").attr("data-hidden", "true").html("&times;").appendTo(head);
    $("<button/>").addClass("btn btn-default").attr("data-dismiss", "modal").prop("type", "button").html("Close").appendTo(foot);
    if (title_m) {
        $("<h4/>").addClass("modal-title").html(title).appendTo(head)
    } else {
        $("<h4/>").addClass("modal-title").text(title).appendTo(head)
    }
    if (data.wrap_id) {
        wrap.prop("id", data.wrap_id)
    }
    if (data.body_id) {
        body.prop("id", data.body_id)
    }
    if (data.footer) {
        foot.appendTo(content)
    }
    if (data.destroy) {
        wrap.on("hidden.bs.modal", function() {
            wrap.remove()
        })
    }
    if (data.attach) {
        wrap.appendTo(data.attach)
    }
    return wrap
}(function(CyTube_Settings) {
    return CyTube_Settings(window, document, window.jQuery)
})(function(window, document, $, undefined) {
    if (!$("#customSettingsStaging").length) {
        $("<div/>").prop("id", "customSettingsStaging").hide().insertAfter("#useroptions")
    }
    if ($("#customSettingsModal").length) {
        $("#customSettingsWrap .customSettings").detach().appendTo($("#customSettingsStaging"));
        $("#customSettingsModal").remove()
    }
    if ($("#customSettingsModalTrigger").length) {
        $("#customSettingsModalTrigger").unbind().remove()
    }
    $("<button/>").prop("id", "customSettingsModalTrigger").attr("title", "Custom Settings").addClass("btn btn-sm btn-default").html('<span class="glyphicon glyphicon-tasks"></span> Channel Control').button().appendTo("#customSettingsStaging").attr("data-toggle", "modal").click(function(event) {
        createModal({
            title: "Custom Channel Settings: " + CHANNEL.name,
            wrap_id: "customSettingsModal",
            body_id: "customSettingsWrap",
            footer: true
        }).on("show.bs.modal", function(event) {
            var row = $("<div/>").addClass("row").appendTo("#customSettingsWrap");
            $("#customSettingsStaging .customSettings").each(function() {
                var panel = $("<div/>").addClass("panel panel-primary");
                var heading = $("<div/>").addClass("panel-heading").appendTo(panel).text($(this).data().title);
                var body = $("<div/>").addClass("panel-body").appendTo(panel);
                if ($(this).data("column-class")) {
                    $("<div/>").addClass($(this).data("column-class")).appendTo(row).append(panel)
                } else {
                    $("<div/>").addClass("col-sm-6").appendTo(row).append(panel)
                }
                $(this).detach().appendTo(body)
            })
        }).on("hidden.bs.modal", function(event) {
            $("#customSettingsWrap .customSettings").detach().appendTo($("#customSettingsStaging"));
            $("#customSettingsModal").remove()
        }).insertAfter("#useroptions").modal()
    });
    if (USEROPTS.layout.match(/synchtube/)) {
        $("#customSettingsModalTrigger").detach().appendTo("#leftcontrols")
    } else {
        $("#customSettingsModalTrigger").detach().prependTo("#leftcontrols")
    }
});