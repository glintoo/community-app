import { ElementHelper, BrowserHelper } from "topcoder-testing-lib";
import { logger } from "../../../../logger/logger";
import { HeaderPage } from "./header.po";
import { HeaderConstants } from "./header.constants";
import { ConfigHelper } from "../../../../utils/config-helper";
import { CommonHelper } from "../common-page/common.helper";
import { LoginPage } from "../login/login.po";

export class HeaderHelper {
  /**
   * Initialize the challenge listing Page Object
   */
  public static initialize() {
    this.headerPageObject = new HeaderPage();
    this.loginPageObject = new LoginPage();
  }

  /**
   * sets the Challenge Listing page object
   */
  public static setHeaderPage(header) {
    this.headerPageObject = header;
  }

  /**
   * Opens the Challenge Listing page
   */
  public static async open() {
    await this.headerPageObject.open();
  }

  /**
   * Verify the logo link redirection
   * @param isLoggedIn
   */
  public static async verifyLogoLink(isLoggedIn) {
    const expectedUrl = isLoggedIn
      ? ConfigHelper.getSubMenuUrl("dashboard", true)
      : ConfigHelper.getLogoRedirectionUrl();
    await this.headerPageObject.clickOnLogoLink();
    const currentUrl = await BrowserHelper.getCurrentUrl();
    expect(currentUrl).toEqual(expectedUrl);
  }

  /**
   * Verify the redirection on clicking the login header link
   */
  public static async verifyLoginLink() {
    const expectedUrl = ConfigHelper.getLoginUrl();
    await this.headerPageObject.clickOnLoginLink();
    await CommonHelper.verifyCurrentUrlToContain(expectedUrl);
  }

  /**
   * Verify the redirection on clicking the "BUSINESS" header link
   */
  public static async verifyBusinessLink() {
    await this.headerPageObject.clickOnBusinessLink();
    await this.loginPageObject.waitForHomePage();
  }

  /**
   * Verify the header menu
   * It verifies if the sub-menu items are correct and
   * also verifies the redirection on clicking each sub-menu
   * @param menu - menu to be verified
   * @param isLoggedIn
   */
  public static async verifyMenu(menu, isLoggedIn?: boolean) {
    const menuItem = HeaderConstants.getMenu(isLoggedIn)[menu];
    // By default community menu is open
    if (menu != "Community") {
      await this.headerPageObject.clickOnMenu(menuItem.text);
    }
    const submenuNames = await this.headerPageObject.getSubMenuNames();
    const expectedSubmenuNames = menuItem.submenus.map((s) => s.text);
    expect(submenuNames).toEqual(expectedSubmenuNames);

    const submenus: Object[] = menuItem.submenus;

    for (let i = 0; i < submenus.length; i++) {
      const subMenu = submenus[i];
      const text = subMenu["text"];
      const url = subMenu["url"];

      if (text === "All Challenges") {
        continue;
      }

      await this.headerPageObject.clickOnMenu(text);
      await BrowserHelper.sleep(1000);
      if (text === "Payments" || text === "Forums") {
        await CommonHelper.verifyPopupWindowWithUrl(url);
      } else if (text === "Competitive Programming" && !isLoggedIn) {
        await CommonHelper.verifyCurrentUrlToContain(url);
      } else {
        await CommonHelper.verifyCurrentUrl(url);
      }

      await this.headerPageObject.open();
      // By default community menu is open
      if (menu != "Community") {
        await this.headerPageObject.clickOnMenu(menuItem.text);
      }
    }
  }

  /**
   * Verifies the user section in the user avatar menu
   */
  public static async verifyUserMenuProfileLink() {
    const expectedUrl = ConfigHelper.getSubMenuUrl("myProfile", true);
    await this.headerPageObject.openUserMenu();
    await this.headerPageObject.clickOnUserInfoSection();
    await BrowserHelper.sleep(1000);
    await CommonHelper.verifyCurrentUrl(expectedUrl);
  }

  /**
   * Verifies the 'Switch to Business' link in the user avatar menu
   */
  public static async verifyUserMenuBusinessLink() {
    await this.headerPageObject.openUserMenu();
    await this.headerPageObject.clickOnSwitchToBusinessLink();
    const expectedUrl = ConfigHelper.getBusinessUrl();
    await BrowserHelper.sleep(1000);
    await CommonHelper.verifyCurrentUrl(expectedUrl);
  }

  /**
   * Verifies the 'Settings' link in the user avatar menu
   */
  public static async verifyUserMenuSettingsLink() {
    await this.headerPageObject.openUserMenu();
    await this.headerPageObject.clickOnSettingsLink();
    const expectedUrl = ConfigHelper.getProfileUrl();
    await BrowserHelper.sleep(1000);
    await CommonHelper.verifyCurrentUrl(expectedUrl);
  }

  /**
   * Verifies the 'Help' link in the user avatar menu
   */
  public static async verifyUserMenuHelpLink() {
    await this.headerPageObject.openUserMenu();
    await this.headerPageObject.clickOnHelpLink();
    const expectedUrl = ConfigHelper.getHelpUrl();
    await BrowserHelper.sleep(1000);
    await CommonHelper.verifyCurrentUrl(expectedUrl);
  }

  /**
   * Verifies the 'Log out' link in the user avatar menu
   */
  public static async verifyUserMenuLogoutLink() {
    await this.headerPageObject.openUserMenu();
    await this.headerPageObject.clickOnLogoutLink();
    await this.loginPageObject.waitForHomePage();
  }

  /**
   * Verifies the notification menu
   */
  public static async verifyNotificationPopup() {
    await this.headerPageObject.openNotificationsPopup();
    expect(await this.headerPageObject.isNotificationsPopupVisible()).toBe(
      true
    );
  }

  /**
   * Verifies the 'View all notifications' link if present
   */
  public static async verifyAllNotificationsLink() {
    await BrowserHelper.sleep(1000);
    await this.headerPageObject.openNotificationsPopup();
    if (this.headerPageObject.isViewAllNotificationsPresent) {
      await this.headerPageObject.clickOnViewAllNotificationsLink();
      const expectedUrl = ConfigHelper.getAllNotificationsUrl();
      await CommonHelper.verifyCurrentUrl(expectedUrl);
    }
  }

  /**
   * Verifies the behaviour of searching by username
   * @param username
   */
  public static async verifySearchByUsername(username) {
    await this.headerPageObject.search(username);
    const expectedUrl = ConfigHelper.getSearchUrl() + "?q=" + username;
    await BrowserHelper.waitUntilUrlIs(expectedUrl);
    logger.info("Search with username: " + username);

    const usernameEl = ElementHelper.getTagElementMatchingText("h1", username);
    await BrowserHelper.waitUntilVisibilityOf(usernameEl);
    expect(await usernameEl.getText()).toEqual(username);
  }

  /**
   * Verifies the behaviour of searching by skill
   * @param skill
   */
  public static async verifySearchBySkill(skill) {
    await this.headerPageObject.search(skill);
    const expectedUrl = ConfigHelper.getSearchUrl() + "?q=" + skill;
    await BrowserHelper.waitUntilUrlIs(expectedUrl);
    logger.info("Search with skill: " + skill);

    const skillsEl = ElementHelper.getTagElementContainingText("span", skill);
    await BrowserHelper.waitUntilVisibilityOf(skillsEl);
    const skillsText = await skillsEl.getText();
    logger.info("Skills found: " + skillsText);
    expect(skillsText.includes(skill)).toBe(true);
  }

  private static headerPageObject: HeaderPage;
  private static loginPageObject: LoginPage;
}
