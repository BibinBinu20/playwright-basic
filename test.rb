require "spec_helper"
require "rest-client"


feature "SCC Order Confirmation - E2E Functional Integration", type: :feature, js: true do
  include SessionHelper
  include SharedHelper
  include PoHelper
  include SupplierInvoiceHelper
  include CoupaHelper  #needed for CXML supplier confirmations
  include CSVDataHelper  # csv flow
  include CSVExportHelper  # csv flow

  let(:req_show_page) { RequisitionsPage::Show.new }
  let(:po_show_page) { PurchaseOrdersPage::Show.new }
  let(:supplier_po_page) { SupplierPurchaseOrdersPage::Show.new }
  let(:po_order_confirmation_page) { PurchaseOrdersPage::OrderConfirmationShow.new }
  let(:po_supplier_order_confirmation_page) { SupplierPurchaseOrdersPage::OrderConfirmationShow.new }
  let!(:po_supplier_order_confirmation_index) { SupplierPurchaseOrdersPage::OrderConfirmationIndex.new } # csv flow
  let!(:supplier_order_confirmation_loader_page) { SupplierPurchaseOrdersPage::OrderConfirmationBulkLoader.new } # csv loader
  let!(:api_user) { create(:api_user_with_key) }
  let(:ship_to_address) { create(:address, name: "test address") }
  let(:ship_to_user) { create(:user) }
  let!(:oauth_user) { create(:oauth_user_without_callbacks) }
  let(:scopes) { OpenidConnect::OidcScope.where(name: ["core.order_header_confirmation.assignment.read", "core.order_header_confirmation.assignment.write", "core.order_header_confirmations.read", "core.order_header_confirmations.write", "core.purchase_order_change.assignment.read", "core.purchase_order_change.assignment.write", "core.purchase_order_change.read", "core.purchase_order_change.write", "core.purchase_order_only.read", "core.purchase_order_only.write", "core.purchase_order.assignment.read", "core.purchase_order.assignment.write", "core.purchase_order.read", "core.purchase_order.write", "core.requisition.assignment.read", "core.requisition.assignment.write", "core.requisition.read", "core.requisition.write"].uniq) }
  let(:client) { OpenidConnect::OidcClient.create(name: "test client", grant_type: "authorization_code", system: false, oidc_scopes: scopes) }
  let(:token) { OpenidConnect::OidcAccessToken.create(oidc_client: client, user: oauth_user, oidc_scopes: client.oidc_scopes) }
  let!(:need_by_date) { 21.days.from_now.beginning_of_day }
  given!(:buyer_user) do
    create(:user, :with_roles, roles: "Buyer, User", firstname: "buyerfirst", lastname: "buyerlast", login: "buyer_user_login")
  end
  let!(:supplier) { create(:supplier, name: "Supplier_SCC", allow_partial_confirmations: true, coupa_connect_status: "Linked", cxml_invoice_supplier_domain: "DUNS", cxml_invoice_supplier_identity: "collab131", cxml_invoice_buyer_domain: "DUNS", cxml_invoice_buyer_identity: "Coupa", cxml_invoice_secret: "abc", allow_cxml_invoicing: 1) }
  let!(:supplier_user) { create(:supplier_user, login:"supplier_login",supplier:) }
  let!(:user) { create(:admin) }
  let(:cxml_user) { create(:cxml_user, supplier:) }
  let!(:account_type) { create(:account_type, name: "SCCCOA", segment_1_model: "user", segment_1_column: "default_account.current_code") }
  let!(:account) { create(:account, name: "SCCACCT", code: "SCCACCTCode", account_type_id: account_type.id) }

  let!(:cxml_create_po_payload) {
    %(
    <?xml version="1.0" encoding="UTF-8"?>
      <order-header>
         <type>ExternalOrderHeader</type>
         <version>1</version>
         <currency>
            <code>USD</code>
         </currency>
         <po-number>EXTPO-001</po-number>
         <order-confirmation-level>line</order-confirmation-level>
         <confirm-by-hrs>24</confirm-by-hrs>
         <supplier>
            <name>#{supplier.name}</name>
         </supplier>
         <ship-to-address>
            <name>#{ship_to_address.name}</name>
         </ship-to-address>
         <ship-to-user>
            <login>#{ship_to_user.login}</login>
         </ship-to-user>
         <payment-method/>
         <ship-to-attention>bibin_binu1</ship-to-attention>
         <order-lines type="array">
            <order-line>
               <line-num>1</line-num>
               <need-by-date>#{3.days.from_now.to_date.strftime("%Y-%m-%d")}</need-by-date>
               <description>Test line 1</description>
               <price type="decimal">100</price>
               <quantity type="decimal">5</quantity>
               <uom>
                  <code>EA</code>
               </uom>
               <currency>
                  <code>USD</code>
               </currency>
                 <account>
                  <name>#{account.name}</name>
                  <code>#{account.code}</code>
                  <account-type>
                     <name>#{account.account_type.name}</name>
                  </account-type>
               </account>
            </order-line>
            <order-line>
               <line-num>2</line-num>
               <need-by-date>#{3.days.from_now.to_date.strftime("%Y-%m-%d")}</need-by-date>
               <description>Test line 2</description>
               <price type="decimal">100</price>
               <quantity type="decimal">5</quantity>
               <uom>
                  <code>EA</code>
               </uom>
               <currency>
                  <code>USD</code>
               </currency>
               <account>
                  <name>#{account.name}</name>
                  <code>#{account.code}</code>
                  <account-type>
                     <name>#{account.account_type.name}</name>
                  </account-type>
               </account>
            </order-line>
         </order-lines>
      </order-header>
    ).strip
  }
  let(:cxml_supplier_confirm_payload)  {
    %(
   <?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE cXML SYSTEM "http://xml.cXML.org/schemas/cXML/1.2.036/Fulfill.dtd">
<cXML payloadID="i-am-a-payload-id"
      xml:lang="en-US" timestamp="2000-10-14T08:39:29-08:00">
  <Header>
    <From>
      <!-- domain attr is 'cxml_invoice_supplier_domain' -->
      <Credential domain="DUNS">
        <!-- Identity content is 'cxml_invoice_supplier_identity' -->
        <Identity>collab131</Identity>
      </Credential>
    </From>
    <To>
      <!-- This is not used by Coupa -->
      <Credential domain="DUNS">
        <!-- This is not used by Coupa -->
        <Identity>Coupa</Identity>
      </Credential>
    </To>
    <!-- The supplier -->
    <Sender>
      <!-- domain attr must match Header/From/Credential['domain'] attr -->
      <Credential domain="DUNS">
        <!-- Identity content is must match Header/From/Credential/Identity content -->
        <Identity>collab131</Identity>
        <!-- SharedSecret contents 'cxml_invoice_secret' -->
        <SharedSecret>abc</SharedSecret>
      </Credential>
      <!-- This is not used by Coupa -->
      <UserAgent>Random HTTP Agent</UserAgent>
    </Sender>
  </Header>
<Request deploymentMode="production">
        <ConfirmationRequest>
            <!-- operations and type is used by coupa -->
            <!-- operations= update Coupa will error this out, given that we do not currently allow more than 1 back-and-forth -->
            <ConfirmationHeader type="detail"
                         noticeDate="2000-10-13T18:39:09-08:00"
                         operation="new"
                         invoiceID="I1102-10-13">
                <!-- These elements are not used by Coupa -->
                <DocumentReference payloadID="123coupa" />
                <Total>
                    <Money currency="USD">10000.0</Money>
                </Total>
                <Shipping>
                    <Money currency="USD">2.5</Money>
                    <Description xml:lang="en-CA">FedEx 2-day</Description>
                </Shipping>
                <Tax>
                    <Money currency="USD">0.19</Money>
                    <Description xml:lang="en-US">CA Sales Tax</Description>
                </Tax>
                <Contact role="shipFrom">
                    <Name xml:lang="en-US">Workchairs, Vancouver</Name>
                    <PostalAddress>
                        <Street>432 Lake Drive</Street>
                        <City>Vancouver</City>
                        <State>BC</State>
                        <PostalCode>B3C 2G4</PostalCode>
                        <Country isoCountryCode="US">Canada</Country>
                    </PostalAddress>
                    <Phone>
                        <TelephoneNumber>
                            <CountryCode isoCountryCode="US">1</CountryCode>
                            <AreaOrCityCode>201</AreaOrCityCode>
                            <Number>9211132</Number>
                        </TelephoneNumber>
                    </Phone>
                </Contact>
                <Comments xml:lang="en-US">Look's great, but for the price.</Comments>
            </ConfirmationHeader>
            <!-- orderID attr is an OrderHeader ID number that will become associated to the OrderConfirmation::Line -->
            <OrderReference orderID="#{@po_number}" orderDate="2024-06-11T12:34:45Z">
                <DocumentReference payloadID="456coupa" />
            </OrderReference>
            <!-- ConfirmationItem elements should be present to provide status information for individual line items in the order -->
        <ConfirmationItem lineNumber="1" quantity="5">
            <UnitOfMeasure>EA</UnitOfMeasure>
            <ConfirmationStatus quantity="5" type="accept" shipmentDate="#{3.days.from_now.to_date.strftime("%Y-%m-%d")}"
                                deliveryDate="#{3.days.from_now.to_date.strftime("%Y-%m-%d")}">
                <UnitOfMeasure>EA</UnitOfMeasure>
                <UnitPrice>
                    <Money currency="USD">100.0</Money>
                </UnitPrice>
                <Comments xml:lang="en-US">Qty Updated</Comments>
            </ConfirmationStatus>
        </ConfirmationItem>
        <ConfirmationItem lineNumber="2" quantity="5">
            <UnitOfMeasure>EA</UnitOfMeasure>
            <ConfirmationStatus quantity="3" type="accept" shipmentDate="#{3.days.from_now.to_date.strftime("%Y-%m-%d")}"
                                deliveryDate="#{3.days.from_now.to_date.strftime("%Y-%m-%d")}">
                <UnitOfMeasure>EA</UnitOfMeasure>
                <UnitPrice>
                <Money currency="USD">100.0</Money>
                </UnitPrice>
                <Comments xml:lang="en-US">Comment for line 2 - quantity changed </Comments>
            </ConfirmationStatus>
                        <ConfirmationStatus quantity="2" type="reject" shipmentDate="#{3.days.from_now.to_date.strftime("%Y-%m-%d")}"
                                deliveryDate="#{3.days.from_now.to_date.strftime("%Y-%m-%d")}">
                <UnitOfMeasure>EA</UnitOfMeasure>
                <UnitPrice>
                <Money currency="USD">100.0</Money>
                </UnitPrice>
                <Comments xml:lang="en-US">Comment for line 2 - quantity changed </Comments>
            </ConfirmationStatus>
        </ConfirmationItem>
        </ConfirmationRequest>
    </Request>
</cXML>
    ).strip
  }
  let(:json_put_payload) do
    JSON.dump(
      {
        "order-line-confirmations": [
          {
            "line-number": "2",
            "action": "accept"
          }
        ]
      }
    )
  end

  let(:json_integration_failed_payload) do
    JSON.dump({ "integration_message": "Failed" })
  end
  let(:json_integration_complete_payload) do
    JSON.dump({ "integration_message": "Success" })
  end

  given!(:current_time) do
    today = Date.today
    new_time = Time.zone.local(today.year, today.month, today.day, 10, 0, 0)
    new_time
  end

  # given!(:admin_user) { create(:admin) }
  # given!(:account_type) { create(:account_type, name: "SCCAccountType") }
  # given!(:account) { create(:account, name: "SCCAccount1", code: "SCCAccountCode1", account_type:, active: true) }

  background do
    ignore_api_authentication
    u = User.current_user
    allow(u).to receive(:authorized?).and_return(true)
    allow(Flavor).to receive(:external_orders?).and_return(true)
    allow(Setup).to receive(:enable_order_confirmation_for_external_order?).and_return(true)
    allow(Setup).to receive(:integration_enabled?).and_return(true)
    allow(Setup).to receive(:price_hidden?).and_return(true)
    allow(Setup).to receive(:enable_partial_confirmation?).and_return(true)
    Setup.assign("enable_po_collaboration", 1)
    Setup.assign("core.procurement.advanced_supplier_collaboration", 1)
    Setup.assign("users_can_request_po_changes", 1)
    Setup.assign("po_collab_intelligence", 1)
    supplier_user.roles << Role.find_by(name: "CSP Order")
    supplier_user.roles << Role.find_by(name: "CSP Order Line Confirmation")
    allow_any_instance_of(Supplier).to receive(:allow_order_confirmation_item_substitutions).and_return(true)
    # allow(User).to receive(:current_user).and_return(api_user)
     allow(Setup).to receive(:allow_cxml_1_2_036?).and_return(true)
  end

  scenario "complete order flow (basic) supplier -> buyer -> confirmed " do
    # req_header=supplier=supplier_site=supplier_user=po_item=nil
    Given "Buyer Login and Create PO" do
      login_as buyer_user.login
      @supplier = create(:supplier, name: "test_supplier_1", order_confirmation_level: "line", confirm_by_hrs: 16)
      @supplier_site = create(
        :supplier_site, name: "S1Site1", supplier: @supplier,
        order_confirmation_level: "header", confirm_by_hrs: 30
      )
      @supplier_user = create(:supplier_user, login: "supplier_login", supplier: @supplier)
      buyer_user.current_cart = create(:requisition_header,created_by:buyer_user,requested_by: buyer_user)
      @req_header = RequisitionHeader.last
      @req_header.lines << create(
        :requisition_quantity_line, requisition_header: @req_header, line_num: 1, description: "TestItem1",
        quantity: 10.0, unit_price: Money.new(22, "USD"), supplier_id: @supplier.id,
        supplier_site_id: @supplier_site.id, account:, need_by_date: 18.days.from_now, order_confirmation_level: "line", confirm_by_hrs: 96
      )
      @req_header.lines << create(
        :requisition_quantity_line, requisition_header: @req_header, line_num: 2, description: "TestItem2",
        quantity: 5.0, unit_price: Money.new(25, "USD"), supplier_id: @supplier.id,
        supplier_site_id: @supplier_site.id, account:, need_by_date: 12.days.from_now, order_confirmation_level: "line", confirm_by_hrs: 96
      )
      @req_header.lines << create(
        :requisition_quantity_line, requisition_header: @req_header, line_num: 3, description: "TestItem3",
        quantity: 15.0, unit_price: Money.new(12, "USD"), supplier_id: @supplier.id,
        supplier_site_id: @supplier_site.id, account:, need_by_date: 13.days.from_now, order_confirmation_level: "line", confirm_by_hrs: 96
      )
    end

    Then "I validate PO is created for the set requisition" do
      req_show_page.load id: @req_header.id
      wait_for_ajax
      @req_header.submit_for_approval!
      @req_header.approve!
      expect(@req_header.status).to eq "ordered"
      @po_item = OrderHeader.find_by(supplier_id: Supplier.find_by(name: "test_supplier_1").id)
    end

    When "I login to CSP and load the PO" do
      @supplier_user.roles << Role.find_by(name: "CSP Order")
      @supplier_user.roles << Role.find_by(name: "CSP Order Line Confirmation")
      stub_csn_supplier_login @supplier_user.login
      allow_any_instance_of(SupplierConnectHelper).to receive(:new_iframe_authentication?) { true }
      wait_until_true { supplier_po_page.load(id: @po_item.id) }
      # expect(req_header).status to eq "Pending Confirmation"
       expect(supplier_po_page.confirmation_status).to have_text "Pending Confirmation"
    end

    And "I load Confirmation page (click on view confirmation) " do
      supplier_po_page.view_order_confirmation.click
      wait_for_ajax
    end

    And "I accept line # 1" do
      # first line
      po_supplier_order_confirmation_page.line_confirmation_data_table.lines[0].actions.accept.click
    end
    And "I Accept line # 2" do
      # 2nd line
      po_supplier_order_confirmation_page.line_confirmation_data_table.lines[1].actions.accept.click
    end
    And "I Reject line # 2" do
      # third line
      po_supplier_order_confirmation_page.line_confirmation_data_table.lines[2].actions.reject.click
      expect(po_supplier_order_confirmation_page.reject_popup).to be_present
      react_select_option(po_supplier_order_confirmation_page.reason_insight_dropdown, "Out of stock")
      # po_supplier_order_confirmation_page.comment.set "Test Comment"
      po_supplier_order_confirmation_page.confirm_popup_button.click
      wait_for_ajax
      expect(po_supplier_order_confirmation_page.line_confirmation_data_table.lines[2].status_badge).to have_text "Cannot Fulfill"
    end

    When "I submit Order Confirmation from CSP and validate status on header and lines" do
      po_supplier_order_confirmation_page.confirm_button.click
      wait_for_ajax
      expect(supplier_po_page.flash_message).to have_text "Order confirmation is submitted"
    end
    # Then "Checking the status of order" do
    #   expect(supplier_po_page.flash_message).to have_text "Order confirmation is submitted"
    # end

    And "Checking the order header status" do
      expect(supplier_po_page.confirmation_status).to have_text "Pending Buyer Review"
    end

    When "Buyer Login and Checks the status of PO" do
      login_as buyer_user.login
      wait_until_true { po_show_page.load(id: @po_item.id) }
      # expect(req_header).status to eq "Pending Confirmation"
      expect(po_show_page.confirmation_status).to have_text "Pending Buyer Review"
    end
    And "Buyer load Confirmation page (click on view confirmation) " do
      po_show_page.view_order_confirmation.click
      wait_for_ajax
    end
    And "Buyer Checks Status of line 1" do
      expect(po_order_confirmation_page.line_confirmation_data_table.lines[0].status_badge).to have_text "Confirmed"
    end
    And "Buyer Checks Status of line 2" do
      expect(po_order_confirmation_page.line_confirmation_data_table.lines[1].status_badge).to have_text "Confirmed"
    end
    # And "Buyer Checks Status of line 3" do
    #   expect(po_order_confirmation_page.line_confirmation_data_table.lines[2].status_badge).to have_text "Supplier Proposed Changes"
    # end
    And "Buyer Rejects line 3" do
      po_order_confirmation_page.line_confirmation_data_table.lines[2].actions.reject.click
      react_select_option(po_supplier_order_confirmation_page.reason_insight_dropdown, "Must fulfill per contract")
      po_supplier_order_confirmation_page.comment.set "Test Comment"
      po_supplier_order_confirmation_page.confirm_popup_button.click
      wait_for_ajax
      expect(po_order_confirmation_page.line_confirmation_data_table.lines[2].status_badge).to have_text "Overridden"
    end
    And "Buyer submits the confirmation" do
      po_order_confirmation_page.confirm_button.click
      wait_for_ajax
    end
    Then "Buyer Checks status of PO" do

      expect(po_show_page.confirmation_status).to have_text "Confirmed"
    end
  end

  scenario "seller edit line price and submit trigger order change approval" do
    Given "Buyer Login and Create a PO" do
      login_as buyer_user.login
      @supplier = create(:supplier, name: "test_supplier_1", order_confirmation_level: "line", confirm_by_hrs: 16)
      @supplier_site = create(
        :supplier_site, name: "S1Site1", supplier: @supplier,
        order_confirmation_level: "header", confirm_by_hrs: 30
      )
      @supplier_user = create(:supplier_user, login: "supplier_login", supplier: @supplier)
      buyer_user.current_cart = create(:requisition_header,created_by:buyer_user,requested_by: buyer_user)
      @req_header = RequisitionHeader.last
      @req_header.lines << create(
        :requisition_quantity_line, requisition_header: @req_header, line_num: 1, description: "TestItem1",
        quantity: 10.0, unit_price: Money.new(22, "USD"), supplier_id: @supplier.id,
        supplier_site_id: @supplier_site.id, account:, need_by_date: 18.days.from_now, order_confirmation_level: "line", confirm_by_hrs: 96
      )
      @req_header.lines << create(
        :requisition_quantity_line, requisition_header: @req_header, line_num: 2, description: "TestItem2",
        quantity: 5.0, unit_price: Money.new(25, "USD"), supplier_id: @supplier.id,
        supplier_site_id: @supplier_site.id, account:, need_by_date: 12.days.from_now, order_confirmation_level: "line", confirm_by_hrs: 96
      )
    end
    And "I validate PO is created for the set requisition" do
      req_show_page.load id: @req_header.id
      wait_for_ajax
      @req_header.submit_for_approval!
      @req_header.approve!
      expect(@req_header.status).to eq "ordered"
      @po_item = OrderHeader.find_by(supplier_id: Supplier.find_by(name: "test_supplier_1").id)
    end
    When "I login to CSP and load the PO" do
      @supplier_user.roles << Role.find_by(name: "CSP Order")
      @supplier_user.roles << Role.find_by(name: "CSP Order Line Confirmation")
      stub_csn_supplier_login @supplier_user.login
      allow_any_instance_of(SupplierConnectHelper).to receive(:new_iframe_authentication?) { true }
      wait_until_true { supplier_po_page.load(id: @po_item.id) }
      # expect(req_header).status to eq "Pending Confirmation"
      expect(supplier_po_page.confirmation_status).to have_text "Pending Confirmation"
    end

    And "I load Confirmation page (click on view confirmation) " do
      supplier_po_page.view_order_confirmation.click
      wait_for_ajax
    end

    And "I accept line # 1" do
      # first line
      po_supplier_order_confirmation_page.line_confirmation_data_table.lines[0].actions.accept.click
    end
    And "I Edit price in line # 2" do
      # 2nd line
       po_supplier_order_confirmation_page.line_confirmation_data_table.lines[1].actions.edit.click
      po_supplier_order_confirmation_page.line_confirmation_data_table.lines[1].price_edit.set "50"
      react_select_option(po_supplier_order_confirmation_page.reason_insight_dropdown, "Out of stock")
      po_supplier_order_confirmation_page.comment.set "Test Comment"
      po_supplier_order_confirmation_page.save_button.click
      wait_for_page_to_load
      wait_for_ajax
      expect(po_supplier_order_confirmation_page.line_confirmation_data_table.lines[1].status_badge).to have_text "Pending Changes"
    end
    And "Submit the PO" do
      po_supplier_order_confirmation_page.confirm_button.click
      wait_for_ajax
      expect(supplier_po_page.flash_message).to have_text "Order confirmation is submitted"
    end
    And "check the status of PO and verify quantity change" do
      wait_until_true { supplier_po_page.load(id: @po_item.id) }
      expect(supplier_po_page.confirmation_status).to have_text "Pending Buyer Review"
      supplier_po_page.view_order_confirmation.click
      wait_for_ajax
      expect(po_supplier_order_confirmation_page.line_confirmation_data_table.lines[1].price).to have_text "50.00 25.00"
    end
    And "Buyer check the status of PO" do
      login_as buyer_user.login
      wait_until_true { po_show_page.load(id: @po_item.id) }
      expect(po_show_page.confirmation_status).to have_text "Pending Buyer Review"
    end
    And "Go to confirmation page" do
      po_show_page.view_order_confirmation.click
      wait_for_ajax
    end
    And "I accept line 2" do
      po_order_confirmation_page.line_confirmation_data_table.lines[1].actions.accept.click
      wait_for_ajax
    end
    And "I submit the order" do
      po_order_confirmation_page.confirm_button.click
      wait_for_ajax
    end
    And "Change order process is initiated" do
      expect(po_show_page.confirmation_status).to have_text "Processing in Background"
    end
    Then "Wait for some time and check if change order initiated" do
      sleep 5
      po_show_page.refresh
      wait_for_page_to_load
      po_show_page.confirmation_status_link.click
      wait_for_page_to_load
      # expect(po_show_page.confirmation_status).to have_text "Change order process"
      expect(page.find('.confirmationTitle', visible: :all)).to have_text "Order Confirmation Creating Change Request"
    end
  end

  scenario "External PO flow " do
    When "Buyer creates an order via api" do
    allow(User).to receive(:current_user).and_return(api_user)
    http = HelperSteps.get_http_with_port
    headers = { "ACCEPT" => "application/xml", "AUTHORIZATION" => "Bearer #{token.unhashed_token}"}
    post_url = Net::HTTP::Post.new("/api/purchase_orders", headers)
    post_url.body = cxml_create_po_payload
    @response = http.request(post_url)
    # $stderr.puts @response.body
    expect(@response.code).to eq("201")
    @parsed_response = Nokogiri::XML(@response.body)
    @po_id = @parsed_response.at_xpath("//id").text.strip
    @po_number = @parsed_response.at_xpath("//po-number").text.strip
    end

    And "Issue the PO" do
      http = HelperSteps.get_http_with_port
      headers = { "ACCEPT" => "application/xml", "AUTHORIZATION" => "Bearer #{token.unhashed_token}"}
      put_url = Net::HTTP::Put.new("/api/purchase_orders/#{@po_id}/issue", headers)
      @response = http.request(put_url)
      #$stderr.puts @response.body
      puts @po_number
      expect(@response.code).to eq("200")

    end
    And " Verify the order confirmation should be yet to confirmed" do
      run_background_job
      wait_for_ajax
      stub_csn_supplier_login supplier_user.login
      allow_any_instance_of(SupplierConnectHelper).to receive(:new_iframe_authentication?) { true }
      wait_until_true { supplier_po_page.load(id: @po_id) }
      wait_for_ajax
      expect(supplier_po_page.confirmation_status).to have_text "Pending Confirmation"
      log_out
    end

    And "Perform Confirmation from supplier" do
      allow(User).to receive(:current_user).and_return cxml_user
      http = HelperSteps.get_http_with_port
      headers = { "ACCEPT" => "application/xml", "AUTHORIZATION" => "Bearer #{token.unhashed_token}"}
      post_url = Net::HTTP::Post.new("/cxml/order_confirmation_request", headers)
      post_url.body=cxml_supplier_confirm_payload
      @response = http.request(post_url)
       $stderr.puts "--------"
      $stderr.puts @response.body
      expect(@response.code).to eq("200")
    end

    And "Check the PO status from supplier side" do
      stub_csn_supplier_login supplier_user.login
      allow_any_instance_of(SupplierConnectHelper).to receive(:new_iframe_authentication?) { true }
      wait_until_true { supplier_po_page.load(id: @po_id) }
      # visit current_url
      # binding.pry
      expect(supplier_po_page.confirmation_status).to have_text "Pending Buyer Review"
    end

    And "Login as buyer and click view order confirmation for the PO" do
      login_as buyer_user.login
      wait_until_true { po_show_page.load(id: @po_id) }
      po_show_page.view_order_confirmation.click
      wait_for_ajax
      parts = current_url.split('?')
      first_param = parts[1].split('&').first if parts.length > 1
      param_name, param_value = first_param.split('=') if first_param
      @confirm_id=param_value
      # $stderr.puts "-----------------------------------------************************"
      # $stderr.puts param_value
      expect(po_order_confirmation_page.confirmation_status).to have_text "Pending Buyer Review"

    end

    And "Checking the Line status of the PO" do
      expect(po_order_confirmation_page.line_confirmation_data_table.lines[0].status_badge).to have_text "Confirmed"
      expect(po_order_confirmation_page.line_confirmation_data_table.lines[1].status_badge).to have_text "Supplier Proposed Changes"
      log_out
    end

    And "Supplier accepts the changes from API" do
      allow(User).to receive(:current_user).and_return(api_user)
      http = HelperSteps.get_http_with_port
      headers = {"CONTENT-TYPE" => "application/json", "ACCEPT" => "application/json", "AUTHORIZATION" => "Bearer #{token.unhashed_token}"}
      put_req = Net::HTTP::Put.new("/api/order_header_confirmations/#{@confirm_id}", headers)
      put_req.body = json_put_payload
      @response = http.request(put_req)
      # $stderr.puts @response.body
      expect(@response.code).to eq("200")
    end

    And "Buyer submit the PO through API" do
      http = HelperSteps.get_http_with_port
      headers = {"CONTENT-TYPE" => "application/json", "ACCEPT" => "application/json", "AUTHORIZATION" => "Bearer #{token.unhashed_token}"}
      post_req = Net::HTTP::Post.new("/api/order_header_confirmations/#{@confirm_id}/submit", headers)
      @response=http.request(post_req)
      expect(@response.code).to eq("200")
    end

    And "Login as buyer again and click view order confirmation for the PO" do
      login_as buyer_user.login
      wait_until_true { po_show_page.load(id: @po_id) }
      expect(po_show_page.confirmation_status).to have_text "Pending Integration"
      log_out
    end
    # And "Click View Confirmation" do
    #   po_show_page.view_order_confirmation.click
    #   wait_for_ajax
    #   parts = current_url.split('?')
    #   first_param = parts[1].split('&').first if parts.length > 1
    #   param_name, param_value = first_param.split('=') if first_param
    #   @confirm_id=param_value
    # end
    And "Pending integration failed via API" do
      allow(User).to receive(:current_user).and_return(api_user)
      http = HelperSteps.get_http_with_port
      headers = {"ACCEPT" => "application/json", "AUTHORIZATION" => "Bearer #{token.unhashed_token}"}
      put_req = Net::HTTP::Put.new("/api/order_header_confirmations/1/integration_failed", headers)
      put_req.body = json_integration_failed_payload
      @response=http.request(put_req)
      expect(@response.code).to eq("200")
    end

  And "Pending integration success via API" do
    http = HelperSteps.get_http_with_port
    headers = {"ACCEPT" => "application/json", "AUTHORIZATION" => "Bearer #{token.unhashed_token}"}
    put_req = Net::HTTP::Put.new("/api/order_header_confirmations/#{(@confirm_id.to_i)}/integration_complete", headers)
    put_req.body = json_integration_complete_payload
    @response=http.request(put_req)
    expect(@response.code).to eq("200")
  end

  Then "Login as buyer again and check status of PO" do
    login_as buyer_user.login
    wait_until_true { po_show_page.load(id: @po_id) }
    expect(po_show_page.confirmation_status).to have_text "Confirmed"
  end
  end


  scenario "CSV Order FLow" do
    Given "Buyer Login and Create PO" do
      login_as buyer_user.login
      @supplier = create(:supplier, name: "test_supplier_1", order_confirmation_level: "line", confirm_by_hrs: 16)
      @supplier_site = create(
        :supplier_site, name: "S1Site1", supplier: @supplier,
        order_confirmation_level: "header", confirm_by_hrs: 30
      )
      @supplier_user = create(:supplier_user, login: "supplier_login", supplier: @supplier)
      buyer_user.current_cart = create(:requisition_header,created_by:buyer_user,requested_by: buyer_user)
      @req_header = RequisitionHeader.last
      @req_header.lines << create(
        :requisition_quantity_line, requisition_header: @req_header, line_num: 1, description: "TestItem1",
        quantity: 10.0, unit_price: Money.new(22, "USD"), supplier_id: @supplier.id,
        supplier_site_id: @supplier_site.id, account:, need_by_date: 18.days.from_now, order_confirmation_level: "line", confirm_by_hrs: 96
      )
      @req_header.lines << create(
        :requisition_quantity_line, requisition_header: @req_header, line_num: 2, description: "TestItem2",
        quantity: 5.0, unit_price: Money.new(25, "USD"), supplier_id: @supplier.id,
        supplier_site_id: @supplier_site.id, account:, need_by_date: 12.days.from_now, order_confirmation_level: "line", confirm_by_hrs: 96
      )
      @req_header.lines << create(
        :requisition_quantity_line, requisition_header: @req_header, line_num: 3, description: "TestItem3",
        quantity: 15.0, unit_price: Money.new(12, "USD"), supplier_id: @supplier.id,
        supplier_site_id: @supplier_site.id, account:, need_by_date: 13.days.from_now, order_confirmation_level: "line", confirm_by_hrs: 96
      )
    end

    And "I validate PO is created for the set requisition" do
      req_show_page.load id: @req_header.id
      wait_for_ajax
      @req_header.submit_for_approval!
      @req_header.approve!
      expect(@req_header.status).to eq "ordered"
      @po_item = OrderHeader.find_by(supplier_id: Supplier.find_by(name: "test_supplier_1").id)
    end

    And "I approve the lines PO is updated for the set requisition" do
      login_as buyer_user.login
      wait_until_true { po_show_page.load(id: @po_item.id) }
      expect(po_show_page.confirmation_status).to have_text "Pending Confirmation"
    end

    And "Supplier login to supplier portal and check the status" do
      @supplier_user.roles << Role.find_by(name: "CSP Order")
      @supplier_user.roles << Role.find_by(name: "CSP Order Line Confirmation")
      stub_csn_supplier_login @supplier_user.login
      allow_any_instance_of(SupplierConnectHelper).to receive(:new_iframe_authentication?) { true }
      wait_until_true { supplier_po_page.load(id: @po_item.id) }
      expect(supplier_po_page.confirmation_status).to have_text "Pending Confirmation"
    end
    And "Supplier selects load from file" do
      wait_until_true {po_supplier_order_confirmation_index.load(id: @po_item.id)}
      wait_for_ajax
      po_supplier_order_confirmation_index.data_table.secondary_actions_button.click
      wait_for_ajax
      wait_until_true {have_selector(po_supplier_order_confirmation_index.data_table_secondary_actions_menu.load_from_file_link, visible: true)}
      po_supplier_order_confirmation_index.data_table_secondary_actions_menu.load_from_file_link.click
      expect(supplier_order_confirmation_loader_page).to have_content "Bulk Load Order Confirmation"
      expect(supplier_order_confirmation_loader_page).to have_start_upload_button
    end

    And "Supplier perform action through CSV" do
      csv_file_line = "spec/fixtures/csv_data/csp_order_line_confirmation.csv.erb"
      @order_header_id = @po_item.id
      @header_action = "line_level"
      @line_action1 = "accept"
      @line_action2 = "reject"
      @line_reason_code2 = "other"
      @line_reason_comment2 = "a rejected via csv"
      @line_action3 = "propose_change"
      @line_qty3 = (@po_item.order_lines[2].quantity + 5).to_s
      @line_price3 = @po_item.order_lines[2].price.to_i + 2
      @line_promiseddate3 = (@po_item.requisition_header.lines[2].need_by_date + 5.days).strftime("%m/%d/%y")
      @line_reason_code3 = "other"
      @line_reason_comment3 = "a proposed new changes"

      csv_file = erb_result_as_file(Rails.root.join(csv_file_line), binding)
      supplier_order_confirmation_loader_page.browse.attach_file(File.absolute_path(csv_file))
      wait_for_ajax
      puts csv_file
      supplier_order_confirmation_loader_page.start_upload_button.click
      wait_for_ajax

      # load_supplier_order_confirmation_csv csv_file_line
      # expect(DataSource.last.upload_errors_count).to eq 0
      finish_file_upload
      supplier_response = OrderConfirmationSupplierResponse.where(order_line_confirmation_id: @po_item.order_line_confirmations.pluck(:id))
      wait_for_ajax
      expect(supplier_response.count).to eq(3)
      expect(@po_item.order_line_confirmations.pluck(:status)).to match_array(["confirmed", "pending_buyer_action", "pending_buyer_action"])
      expect(supplier_response.pluck(:action)).to match_array(["accepted", "rejected", "proposed_change"])

      wait_until_true { po_supplier_order_confirmation_page.load(id: @po_item.id) }
    end
    And "Supplier check status of PO " do
      wait_until_true { supplier_po_page.load(id: @po_item.id) }
      # binding.pry
      expect(supplier_po_page.confirmation_status).to have_text "Pending Buyer Review"
    end

  end

#  def load_supplier_order_confirmation_csv(csv_file)
#   csv_file = erb_result_as_file(Rails.root.join(csv_file), binding)
#   puts csv_file
#   background_process = BackgroundCsvFileLoad.new(
#     file: csv_file,
#     source_for: "SupplierOrderHeaderConfirmation",
#     parameters: {upload_class: "CsvSupplierOrderHeaderConfirmationLoad"}
#    )
#
#   background_process.save!
# background_process.load_from_csv
#  end
# def execute_background_job
#   data_source = DataSource.without_status("done").last
#   return unless data_source
#   method_name = data_source.queue_opts.split(",").second
#   puts method_name
#   data_source.send(method_name)
# end

scenario "Cancelled flow" do
  po_creation
  And "Supplier login to supplier portal and check the status" do
    @supplier_user.roles << Role.find_by(name: "CSP Order")
    @supplier_user.roles << Role.find_by(name: "CSP Order Line Confirmation")
    stub_csn_supplier_login @supplier_user.login
    allow_any_instance_of(SupplierConnectHelper).to receive(:new_iframe_authentication?) { true }
    wait_until_true { supplier_po_page.load(id: @po_item.id) }
    expect(supplier_po_page.confirmation_status).to have_text "Pending Confirmation"
  end
   And "Supplier rejects all lines" do
     supplier_po_page.view_order_confirmation.click
     wait_for_ajax
     po_supplier_order_confirmation_page.select_all_checkbox.click
     wait_for_ajax
     po_supplier_order_confirmation_page.bulk_reject_button.click
     wait_for_ajax
     expect(po_supplier_order_confirmation_page.reject_popup).to be_present
     react_select_option(po_supplier_order_confirmation_page.reason_insight_dropdown, "Replaced with a newer model")
     po_supplier_order_confirmation_page.comment.set "Test Comment"
     po_supplier_order_confirmation_page.confirm_popup_button.click
     wait_for_ajax
     expect(po_supplier_order_confirmation_page.line_confirmation_data_table.lines[0].status_badge).to have_text "Cannot Fulfill"
     expect(po_supplier_order_confirmation_page.line_confirmation_data_table.lines[1].status_badge).to have_text "Cannot Fulfill"
     expect(po_supplier_order_confirmation_page.line_confirmation_data_table.lines[2].status_badge).to have_text "Cannot Fulfill"
   end
  When "I submit Order Confirmation from CSP and validate status on header and lines" do
    po_supplier_order_confirmation_page.confirm_button.click
    wait_for_ajax
    expect(supplier_po_page.flash_message).to have_text "Order confirmation is submitted"
  end
  And "I check the status of the PO" do
    expect(po_supplier_order_confirmation_page.confirmation_status).to have_text "Pending Buyer Review"
  end
  When "I login as buyer and accept all lines" do
    login_as buyer_user.login
    wait_until_true {po_show_page.load(id:@po_item.id) }
    expect(po_show_page.confirmation_status).to have_text "Pending Buyer Review"
    po_show_page.view_order_confirmation.click
    wait_for_ajax
    po_order_confirmation_page.select_all_checkbox.click
    wait_for_ajax
    po_order_confirmation_page.bulk_accept_button.click
    wait_for_ajax
    po_order_confirmation_page.modal_popup_confirm_button.click
    wait_for_ajax
    po_order_confirmation_page.confirm_button.click
  end
  And "buyer checks the status of the PO" do
    expect(po_order_confirmation_page.confirmation_status).to have_text "Processing in Background"
  end
  And "finish the background processing job" do
    finish_order_change
    visit current_url
    wait_for_page_to_load
  end
  And "buyer click on the view confirmation link" do
  po_show_page.confirmation_status_link.click
  wait_for_page_to_load
  page.find("#change_order_status > a").click
  wait_for_page_to_load
  expect(page.find('#pending_cancellation')).to have_text "This Is A Cancellation"

end
  And "bypass approval for the PO" do
    req_show_page.load id: @req_header.id
    oh_change = OrdersPage::OrderHeaderChange.new
    oh_change.load(id: @po_item.id)
    oh_change.by_pass_change_approval.click
    wait_for_ajax
    wait_until_true {po_show_page.load(id:@po_item.id) }
  end
  Then "Check the status of PO is cancelled" do
    expect(po_order_confirmation_page.confirmation_status).to have_text "Cancelled"
  end
end
  end
def finish_file_upload # to be run only after error check assertion : expect(DataSource.last.upload_errors_count).to eq 0
  ds = DataSource.without_status("done").last
  data_source = (ds && (DataSource.last.upload_errors_count == 0)) ? ds : nil
  raise StandardError.new("data source is null") unless data_source
  data_source.do_load_from_csv
end

def finish_order_change
  ds = DataSource.without_status("done").last
  data_source = (ds && (DataSource.last.upload_errors_count == 0)) ? ds : nil
  raise StandardError.new("data source is null") unless data_source
  data_source.create_order_change
end

def po_creation  # just a method to create a Req with 3 lines and flip to PO
    login_as buyer_user.login
    @supplier = create(:supplier, name: "test_supplier_1", order_confirmation_level: "line", confirm_by_hrs: 16)
    @supplier_site = create(
      :supplier_site, name: "S1Site1", supplier: @supplier,
      order_confirmation_level: "header", confirm_by_hrs: 30
    )
    @supplier_user = create(:supplier_user, login: "supplier_login", supplier: @supplier)
    buyer_user.current_cart = create(:requisition_header,created_by:buyer_user,requested_by: buyer_user)
    @req_header = RequisitionHeader.last
    @req_header.lines << create(
      :requisition_quantity_line, requisition_header: @req_header, line_num: 1, description: "TestItem1",
      quantity: 10.0, unit_price: Money.new(22, "USD"), supplier_id: @supplier.id,
      supplier_site_id: @supplier_site.id, account:, need_by_date: 18.days.from_now, order_confirmation_level: "line", confirm_by_hrs: 96
    )
    @req_header.lines << create(
      :requisition_quantity_line, requisition_header: @req_header, line_num: 2, description: "TestItem2",
      quantity: 5.0, unit_price: Money.new(25, "USD"), supplier_id: @supplier.id,
      supplier_site_id: @supplier_site.id, account:, need_by_date: 12.days.from_now, order_confirmation_level: "line", confirm_by_hrs: 96
    )
    @req_header.lines << create(
      :requisition_quantity_line, requisition_header: @req_header, line_num: 3, description: "TestItem3",
      quantity: 15.0, unit_price: Money.new(12, "USD"), supplier_id: @supplier.id,
      supplier_site_id: @supplier_site.id, account:, need_by_date: 13.days.from_now, order_confirmation_level: "line", confirm_by_hrs: 96
    )
    req_show_page.load id: @req_header.id
    wait_for_ajax
    @req_header.submit_for_approval!
    @req_header.approve!
    expect(@req_header.status).to eq "ordered"
    @po_item = OrderHeader.find_by(supplier_id: Supplier.find_by(name: "test_supplier_1").id)
end

# def execute_background_job
#   data_source = DataSource.without_status("done").last
#   return unless data_source
#   method_name = data_source.queue_opts.split(",").second
#   data_source.send(method_name)
# end
