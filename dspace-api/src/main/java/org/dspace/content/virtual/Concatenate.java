/**
 * The contents of this file are subject to the license and copyright
 * detailed in the LICENSE and NOTICE files at the root of the source
 * tree and available online at
 *
 * http://www.dspace.org/license/
 */
package org.dspace.content.virtual;

import java.util.LinkedList;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.dspace.content.Item;
import org.dspace.content.MetadataValue;
import org.dspace.content.service.ItemService;
import org.dspace.core.Context;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * A bean implementing the {@link VirtualBean} interface to achieve the generation of Virtual metadata
 */
public class Concatenate implements VirtualBean {

    @Autowired
    private ItemService itemService;

    /**
     * The fields for which the metadata will be retrieved
     */
    private List<String> fields;
    /**
     * The seperator that will be used to concatenate the values retrieved from the above mentioned fields
     */
    private String separator;

    /**
     * Generic getter for the fields property
     * @return The list of fields to be used in this bean
     */
    public List<String> getFields() {
        return fields;
    }

    /**
     * Generic setter for the fields property
     * @param fields    the list of fields to which the fields property will be set to
     */
    public void setFields(List<String> fields) {
        this.fields = fields;
    }

    /**
     * Generic getter for the seperator
     * @return the seperator to be used by this bean
     */
    public String getSeparator() {
        return separator;
    }

    /**
     * Generic setter for the seperator property
     * @param separator The String seperator value to which this seperator value will be set to
     */
    public void setSeparator(String separator) {
        this.separator = separator;
    }

    /**
     * this method will retrieve the metadata values from the given item for all the metadata fields listed
     * in the fields property and it'll concatenate all those values together with the seperrator specified
     * in this class
     * @param context   The relevant DSpace context
     * @param item      The item that will be used to either retrieve metadata values from
     * @return The String value for all of the retrieved metadatavalues combined with the seperator
     */
    public List<String> getValues(Context context, Item item) {

        List<String> resultValues = new LinkedList<>();
        List<String> value = this.getFields();
        for (String s : value) {
            String[] splittedString = s.split("\\.");

            List<MetadataValue> resultList = itemService.getMetadata(item,
                                                                     splittedString.length > 0 ? splittedString[0] :
                                                                         null,
                                                                     splittedString.length > 1 ? splittedString[1] :
                                                                         null,
                                                                     splittedString.length > 2 ? splittedString[2] :
                                                                         null,
                                                                     Item.ANY);

            String resultString = "";
            for (int i = 0; i < resultList.size(); i++) {
                String metadataValueString = resultList.get(i).getValue();
                if (StringUtils.isNotBlank(metadataValueString)) {
                    if (StringUtils.isNotBlank(resultString)) {
                        resultString += this.getSeparator();
                    }
                    resultString += metadataValueString;
                }
            }
            if (StringUtils.isNotBlank(resultString)) {
                resultValues.add(resultString);
            }
        }

        String result = StringUtils.join(resultValues, this.getSeparator());
        List<String> listToReturn = new LinkedList<>();
        listToReturn.add(result);
        return listToReturn;
    }
}
